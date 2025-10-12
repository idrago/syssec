FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Simple wait script
RUN echo 'while [ ! -f /app/ssl/server.crt ]; do echo "Waiting for certificates..."; sleep 2; done; echo "Starting API..."; node app.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]