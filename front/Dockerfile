FROM node:14.18.0-alpine as base

WORKDIR /app
COPY package*.json /app
RUN npm install
EXPOSE 3000

FROM base as dev
WORKDIR /app
ENV NODE_ENV=development

COPY public /app/public
CMD ["npm", "start"]