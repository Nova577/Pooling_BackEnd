FROM docker.io/node:lts-alpine as builder

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080

COPY ./ /app

RUN npm update && npm install

CMD [ "npm", "run", "start" ]


