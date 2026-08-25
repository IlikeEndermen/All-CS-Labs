# CTF Challenge container with dynamic session-based credentials
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY index.html ./
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
