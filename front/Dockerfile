FROM node:14.18.0-alpine as base

WORKDIR /app
COPY package*.json /
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
RUN npm i
COPY . /
CMD ["npm", "start"]