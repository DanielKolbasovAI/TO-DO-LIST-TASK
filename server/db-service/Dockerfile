FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY ../proto ./proto
EXPOSE 50052

CMD ["npm", "start"]
