FROM ubuntu:latest
LABEL authors="danie"

ENTRYPOINT ["top", "-b"]

# Dockerfile for task-service

# Base image
FROM node:22

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

COPY ../proto ./proto

# Expose port (same as your .env PORT)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
