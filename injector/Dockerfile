FROM node:20

WORKDIR /Injector

COPY injector.js ./

RUN apt update

RUN npm install axios

RUN npm install xml2js

RUN npm install nats

COPY . .

EXPOSE 8080

CMD ["node", "injector.js"]
