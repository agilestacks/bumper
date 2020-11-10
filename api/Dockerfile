FROM node:12.18-alpine3.12

LABEL maintainer="Arkadi Shishlov <arkadi@agilestacks.com>"

ENV BUMPER_API_SECRET unset

ARG NODE_LAUNCHER
ARG NPM_SCRIPT='start'
ENV NPM_SCRIPT $NPM_SCRIPT

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm -q ci --only=prod
RUN if [ "$NODE_LAUNCHER" = "nodemon" ] ; then npm -q i nodemon ; fi
COPY server.js /app/
COPY src/ /app/src/

EXPOSE 3001

CMD npm run $NPM_SCRIPT
