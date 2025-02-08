FROM node:20-alpine

ENV NODE_ENV=development

WORKDIR /app
COPY package*.json /app/
RUN npm install

COPY . /app
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
