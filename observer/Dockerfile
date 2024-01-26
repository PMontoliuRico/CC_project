FROM alpine:3.18
WORKDIR /app
RUN apk update
RUN apk add --update node.js npm
COPY observer.js ./
COPY package-lock.json ./
COPY package.json ./
RUN npm i
CMD ["node", "observer.js"]
