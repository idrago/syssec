FROM node:18-alpine

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies (this creates package-lock.json)
RUN npm install

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Wait script for certificates
RUN echo 'while [ ! -f /app/ssl/server.crt ]; do echo "Waiting for certificates..."; sleep 2; done; echo "Starting attacker site..."; npm start' > /start.sh && chmod +x /start.sh

EXPOSE 443

CMD ["/start.sh"]