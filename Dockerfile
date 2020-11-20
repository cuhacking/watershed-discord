FROM node:14
COPY . /watershed-discord
WORKDIR /watershed-discord
RUN yarn
EXPOSE 80
CMD ["yarn", "start"]

LABEL org.opencontainers.image.source https://github.com/cuhacking/watershed-discord