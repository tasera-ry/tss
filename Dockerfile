# Tasera TSS docker image
FROM node:20 AS frontbuild
ENV NODE_ENV production
ENV NODE_OPTIONS=--max_old_space_size=2048
WORKDIR /usr/src/app
COPY ./front /usr/src/app
RUN npm install && npm run build

FROM node:20 as production
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --from=frontbuild /usr/src/app/build ./front/build
COPY ./back ./back
RUN cd back && npm update && npm install
COPY ./deploy/startup.sh ./
EXPOSE 8093
CMD ["/usr/src/app/startup.sh"]