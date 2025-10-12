# Web Security Examples

A collection of vulnerable web applications for teaching security concepts in UNITO's course on Software and System Security.

## Overview

These examples demonstrate common web vulnerabilities through intentionally insecure applications. Each example is containerized with Docker for easy deployment and includes both vulnerable and protected versions to illustrate attack techniques and defense mechanisms.

## Available Examples

- **web_clickjacking**: UI redressing attacks using transparent iframes
- **web_csrf**: Cross-Site Request Forgery attacks and token-based defenses
- **web_sqli**: SQL Injection vulnerabilities (missing examples of defense)
- **web_ssrf**: Server-Side Request Forgery
- **web_xss**: Cross-Site Scripting (stored, reflected, and DOM-based)

## Usage

Each directory contains:
- `docker-compose.yml`: Container orchestration
- `README.md`: Specific instructions for that vulnerability
- Complete source code for vulnerable and protected versions

To run any example:
```bash
cd web_<example>
docker-compose up -d
```

## Warning

**These applications are intentionally vulnerable and should NEVER be deployed in production environments or on public networks.**

They are strictly for educational purposes in controlled lab environments.

## Acknowledgments

These examples were developed with significant assistance from Claude.ai (Anthropic) to create clear, pedagogical demonstrations of security concepts while maintaining simplicity and focus on learning objectives.
