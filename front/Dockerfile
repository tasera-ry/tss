FROM node:20-alpine as base

WORKDIR /app
COPY package*.json /app/
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
RUN npm install
COPY . /app
CMD ["npm", "start"]