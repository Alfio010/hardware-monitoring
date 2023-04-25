FROM node:20.0.0-alpine3.16

WORKDIR /app

COPY ./home.html ./
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./src ./src
COPY ./prisma ./prisma

RUN npm i 
RUN npx prisma generate

CMD ts-node src/main.ts