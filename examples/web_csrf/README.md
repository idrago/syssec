# CSRF Security Lab - Complete Setup Instructions

## Overview
This Docker lab demonstrates different levels of CSRF protection across multiple university portal APIs:

- **Port 3001**: Vulnerable API (no protection)
- **Port 3002**: CORS-Only API (CORS protection, no CSRF tokens)
- **Port 3003**: Protected API (CSRF tokens + secure CORS)
- **Port 8001**: Student Portal (legitimate frontend)
- **Port 8002**: Attacker Site (malicious CSRF attacks)

## Quick Start

1. **Create Lab Directory**

2. **Create Directory Structure**
   ```bash
   mkdir -p services/vulnerable-api
   mkdir -p services/protected-api  
   mkdir -p services/cors-only-api
   mkdir -p services/teacher-portal
   mkdir -p services/attacker-site
   mkdir -p logs
   ```

3. **Create Docker Compose File**
   Place the `docker-compose.yml` in the root directory

4. **Add Service Files**
   Copy the appropriate files into each service directory according to the file structure below

5. **Start the Lab**
   ```bash
   docker-compose up --build
   ```

6. **Access the Services**
   - Student Portal: http://localhost:8001
   - Attacker Site: http://localhost:8002
   - APIs: http://localhost:3001-3003

## Complete File Structure
```
csrf-lab/
├── docker-compose.yml
├── logs/
└── services/
    ├── vulnerable-api/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── app.js
    ├── protected-api/
    │   ├── Dockerfile  
    │   ├── package.json
    │   └── app.js
    ├── cors-only-api/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── app.js
    ├── teacher-portal/
    │   ├── Dockerfile
    │   └── index.html
    ├── attacker-site/
    │   ├── Dockerfile
    │   └── index.html
```

## Lab Exercises

### Exercise 1: Understand API Differences
1. Visit the Student Portal (http://localhost:8001)
2. Try logging into each API (ports 3001-3003)
3. Note which APIs provide CSRF tokens
4. Check API status endpoints to see security configurations

### Exercise 2: Execute Basic CSRF Attacks
1. Login to the Student Portal using the Vulnerable API (3001)
2. Keep that tab open and visit the Attacker Site (8002)
3. Execute different CSRF attacks:

### Exercise 3: Test Security Protections
1. Repeat attacks against the Protected API (3003)
2. Observe how CSRF tokens prevent attacks
3. Try the CORS-Only API (3002) - note partial protection

### Exercise 4: Browser Manipulation c
1. Open browser with --disable-web-security --user-data-dir=/tmp/chrome_dev
2. Monitor Network tab during attacks

## Production Hardening Checklist

When implementing real CSRF protection:

- [ ] Generate cryptographically secure CSRF tokens
- [ ] Validate tokens on all state-changing operations
- [ ] Set SameSite=Lax or Strict on session cookies
- [ ] Use HttpOnly flag on authentication cookies
- [ ] Implement proper CORS with specific allowed origins
- [ ] Validate Content-Type headers
- [ ] Log and monitor for suspicious activity
- [ ] Regular security testing and penetration testing
- [ ] Keep frameworks and dependencies updated
