# CSRF Security Demonstration Lab

## Overview
This lab demonstrates CSRF vulnerabilities and protections using four different API configurations:

- **Port 3001**: Vulnerable API (no CSRF protection)
- **Port 3002**: CORS-Only API (partial protection) 
- **Port 3003**: Protected API (full CSRF protection)
- **Port 8001**: Teacher Portal (legitimate interface)
- **Port 8002**: Attacker Site (malicious CSRF demos)

## Quick Start

1. **Clone the repo**

2. **Start Lab**
   ```bash
   docker-compose up --build
   ```

3. **Access Services**
   - Teacher Portal: https://localhost:8001
   - Attacker Site: https://localhost:8002
   - APIs: https://localhost:3001-3003

## Demo Flow

### Step 1: Login to Teacher Portal
1. Visit https://localhost:8001
2. Login with credentials: `teacher123` / `password123`
3. Try different APIs to see security differences

### Step 2: Execute CSRF Attacks
1. Keep teacher portal logged in
2. Visit attacker site: https://localhost:8002
3. Execute attacks against different APIs
4. Observe which succeed vs fail

### Step 3: Compare Results
- **Vulnerable API**: All attacks succeed
- **CORS-Only API**: Attacks blocked from unauthorized origins
- **Protected API**: All attacks blocked by CSRF tokens

