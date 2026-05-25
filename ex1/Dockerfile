FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 17000

CMD ["sh", "-c", "node scripts/import.js && node server.js"]
