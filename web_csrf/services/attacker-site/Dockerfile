FROM nginx:alpine

# Create nginx HTTPS configuration for attacker site
RUN echo 'server { \
    listen 443 ssl; \
    server_name localhost; \
    ssl_certificate /etc/nginx/ssl/server.crt; \
    ssl_certificate_key /etc/nginx/ssl/server.key; \
    ssl_protocols TLSv1.2 TLSv1.3; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ =404; \
        add_header X-Frame-Options DENY; \
        add_header X-Content-Type-Options nosniff; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Simple wait script for certificates
RUN echo 'while [ ! -f /etc/nginx/ssl/server.crt ]; do echo "Waiting for certificates..."; sleep 2; done; echo "Starting malicious site..."; nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

COPY index.html /usr/share/nginx/html/

EXPOSE 443

CMD ["/start.sh"]