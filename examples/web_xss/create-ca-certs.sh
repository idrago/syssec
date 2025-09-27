#!/bin/bash

SSL_DIR=${1:-/shared/ssl}
mkdir -p $SSL_DIR

echo "Creating certificates in $SSL_DIR"

# Generate CA private key
openssl genrsa -out $SSL_DIR/ca.key 4096

# Generate CA certificate
openssl req -new -x509 -days 365 -key $SSL_DIR/ca.key -out $SSL_DIR/ca.crt \
    -subj "/C=US/ST=Demo/L=Demo/O=CSRF-Demo-CA/OU=Security/CN=CSRF Demo CA"

# Create OpenSSL config for server certificates
cat > $SSL_DIR/server.conf << 'SSLEOF'
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Demo
L = Demo
O = CSRF Demo
OU = Security
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
SSLEOF

# Generate server private key
openssl genrsa -out $SSL_DIR/server.key 2048

# Generate certificate signing request
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr -config $SSL_DIR/server.conf

# Sign the server certificate with our CA
openssl x509 -req -in $SSL_DIR/server.csr -CA $SSL_DIR/ca.crt -CAkey $SSL_DIR/ca.key \
    -CAcreateserial -out $SSL_DIR/server.crt -days 365 -extensions v3_req -extfile $SSL_DIR/server.conf

# Clean up CSR
rm $SSL_DIR/server.csr

echo "Certificates generated in $SSL_DIR:"
echo "- ca.crt (Certificate Authority - install this in your browser)"
echo "- server.crt (Server certificate)"  
echo "- server.key (Server private key)"

# Set proper permissions
chmod 644 $SSL_DIR/ca.crt $SSL_DIR/server.crt
chmod 600 $SSL_DIR/server.key $SSL_DIR/ca.key