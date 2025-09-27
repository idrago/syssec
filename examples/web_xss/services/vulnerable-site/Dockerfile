FROM php:8.1-apache

# Enable Apache modules
RUN a2enmod ssl rewrite

# Install additional packages if needed
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy website files
COPY . /var/www/html/

# Configure SSL with proper formatting
RUN echo '<VirtualHost *:443>' > /etc/apache2/sites-available/default-ssl.conf && \
    echo '    DocumentRoot /var/www/html' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '    SSLEngine on' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '    SSLCertificateFile /etc/ssl/certs/server.crt' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '    SSLCertificateKeyFile /etc/ssl/private/server.key' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/default-ssl.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/default-ssl.conf

RUN a2ensite default-ssl

# Wait script for certificates
RUN echo 'while [ ! -f /etc/ssl/certs/server.crt ]; do echo "Waiting for certificates..."; sleep 2; done; echo "Starting vulnerable site..."; apache2-foreground' > /start.sh && chmod +x /start.sh

EXPOSE 443

CMD ["/start.sh"]