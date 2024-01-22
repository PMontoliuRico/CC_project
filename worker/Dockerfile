FROM ubuntu:22.04
WORKDIR /app
COPY job_executor.js ./
COPY package-lock.json ./
COPY package.json ./
RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get install -y nodejs
RUN npm i
RUN apt install python3
RUN apt install -y git
CMD node job_executor.js