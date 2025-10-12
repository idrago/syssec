# Clickjacking Lab

A Docker-based demonstration of clickjacking attacks and defenses for educational purposes.

## Setup

1. Clone or download all files maintaining the directory structure
2. Start the lab:
   ```bash
   docker-compose up -d
   ```
3. Access the attacker site: http://localhost:8080

## Lab Structure

- **Port 8080**: Attacker site with various clickjacking demonstrations
- **Port 8081**: Vulnerable bank site (no protection)
- **Port 8082**: Bank site protected with X-Frame-Options
- **Port 8083**: Bank site protected with CSP frame-ancestors

## Exercises

### Exercise 1: Understanding Clickjacking
1. Go to http://localhost:8080
2. Try "Attack 1: Like-Jacking"
3. Press 'D' to toggle iframe visibility
4. Observe how the transparent iframe overlays the decoy content

### Exercise 2: Testing Defenses
1. Click "Test: No Protection" - site loads successfully
2. Click "Test: X-Frame-Options" - site blocked
3. Click "Test: CSP frame-ancestors" - site blocked
4. Open DevTools (F12) Console to see security violations

### Exercise 3: Header Analysis
1. Open DevTools Network tab
2. Load each protected version
3. Examine Response Headers:
   - X-Frame-Options: DENY
   - Content-Security-Policy: frame-ancestors 'self'

## Key Concepts

### Attack Techniques
- Transparent overlay (opacity: 0)
- UI redressing with precise positioning
- Button hijacking

### Defense Mechanisms

**X-Frame-Options (Legacy)**
```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

**CSP frame-ancestors (Modern)**
```
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
```
