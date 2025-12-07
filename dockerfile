FROM node:current-alpine3.21

WORKDIR /app

COPY package.json .

COPY . .

RUN npm install

RUN npx prisma generate

EXPOSE 3000

CMD [ "node", "app.js" ]