FROM node:8-alpine

RUN mkdir -p /usr/src/app/data
WORKDIR /usr/src/app

RUN apk update && apk upgrade

COPY package.json /usr/src/app/

COPY dbproxy.js /usr/src/app/

COPY config.json /usr/src/app/

RUN npm install

CMD [ "npm", "start" ]

EXPOSE 8888
