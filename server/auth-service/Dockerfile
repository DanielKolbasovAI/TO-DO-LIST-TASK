FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
COPY ../proto ./proto
EXPOSE 5000 50052
CMD ["npm", "start"]
