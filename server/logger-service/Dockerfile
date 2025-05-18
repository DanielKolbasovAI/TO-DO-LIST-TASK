FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy rest of the code
COPY . .
COPY ../proto ./proto
# Expose gRPC port (same as your .env)
EXPOSE 50051

# Start the service
CMD ["node", "src/server.js"]
