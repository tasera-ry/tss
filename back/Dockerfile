FROM node:20-alpine as base

WORKDIR /app
COPY package*.json /app
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
WORKDIR /app
RUN npm i -g nodemon && npm i
COPY . /app
CMD ["nodemon", "server.js"]