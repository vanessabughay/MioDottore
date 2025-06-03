# MIODOTTORE/backend/api-gateway/Dockerfile
FROM node:18-slim
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000 
CMD [ "node", "index.js" ]