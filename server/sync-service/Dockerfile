# Base image
FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source code
COPY . .
COPY ../proto ./proto
# Expose gRPC and WebSocket ports
EXPOSE 50055 8080

# Start the sync service
CMD ["node", "index.js"]
