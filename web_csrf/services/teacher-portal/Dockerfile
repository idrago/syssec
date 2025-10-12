FROM nginx:alpine

# Create nginx HTTPS configuration
RUN echo 'server { \
    listen 443 ssl; \
    server_name localhost; \
    ssl_certificate /etc/nginx/ssl/server.crt; \
    ssl_certificate_key /etc/nginx/ssl/server.key; \
    ssl_protocols TLSv1.2 TLSv1.3; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ =404; } \
}' > /etc/nginx/conf.d/default.conf

# Simple wait script
RUN echo 'while [ ! -f /etc/nginx/ssl/server.crt ]; do echo "Waiting for certificates..."; sleep 2; done; echo "Starting nginx..."; nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 443

CMD ["/start.sh"]