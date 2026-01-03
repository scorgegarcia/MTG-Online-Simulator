FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 30007

CMD ["sh", "-c", "npx prisma db push && npm start"]
