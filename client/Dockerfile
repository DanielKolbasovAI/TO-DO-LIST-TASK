FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration development

RUN ls -l /app/dist/client
FROM nginx:stable-alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
