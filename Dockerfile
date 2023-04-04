FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install --only-dev

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT npm start
