# Node.js web challenge container with session-based profiles
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy challenge files
COPY server.js ./
COPY index.html ./
COPY profile.html ./
COPY profile.js ./
COPY login.js ./

# Expose port
EXPOSE 80

# Set environment variables
ENV PORT=80
ENV FLAG_SECRET=MaaSec_CTF_Production_Secret

CMD ["node", "server.js"]
