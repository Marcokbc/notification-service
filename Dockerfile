FROM node:alpine

COPY package*.json ./
RUN npm install

COPY . .

# Comando para iniciar a aplicação
CMD ["sh", "-c", "node index.js"]