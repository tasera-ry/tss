# Tasera TSS docker image
FROM node:20-slim AS frontbuild
ENV NODE_ENV=stable
ENV NODE_OPTIONS=--max_old_space_size=2048
WORKDIR /usr/src/app
COPY ./front/package*.json ./
RUN npm install
COPY ./front ./
RUN npm run build

FROM node:20-slim AS production
ENV NODE_ENV=stable
WORKDIR /usr/src/app
COPY --from=frontbuild /usr/src/app/build ./front/build
COPY ./back ./back
WORKDIR /usr/src/app/back
RUN npm install --production
WORKDIR /usr/src/app
COPY ./deploy/startup.sh ./
EXPOSE 8093
CMD ["/usr/src/app/startup.sh"]
