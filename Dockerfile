FROM node:lts-alpine

WORKDIR /app

COPY ./home.html ./
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./src ./src
COPY ./prisma ./prisma

RUN npm install --save-dev -g ts-node typescript
RUN npm i 
RUN npx prisma generate

CMD ts-node src/main.ts