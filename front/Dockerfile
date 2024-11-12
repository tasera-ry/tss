FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json /app/
EXPOSE 3000

FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . /app
CMD ["npm", "start"]