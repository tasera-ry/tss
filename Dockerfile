# Tasera TSS docker image
FROM node:20 AS frontbuild
ENV NODE_ENV=stable
ENV NODE_OPTIONS=--max_old_space_size=2048
WORKDIR /usr/src/app
COPY ./front /usr/src/app
RUN npm install && npm run build

FROM node:20 AS production
ENV NODE_ENV=stable
WORKDIR /usr/src/app
COPY --from=frontbuild /usr/src/app/build ./front/build
COPY ./back ./back
RUN cd back && npm update && npm install
COPY ./deploy/startup.sh ./
EXPOSE 8093
CMD ["/usr/src/app/startup.sh"]