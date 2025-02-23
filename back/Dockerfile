FROM node:20-alpine

ENV NODE_ENV=development

WORKDIR /app
COPY package*.json /app/
EXPOSE 3000

RUN npm i -g nodemon && npm i
COPY . /app
CMD ["nodemon", "server.js"]
