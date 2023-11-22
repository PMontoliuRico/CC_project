# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 3000
EXPOSE 3000

# Define environment variable
ENV REACT_APP_OAUTH2_PROXY_URL=http://oauth2_proxy:4180

# Run the app
CMD ["npm", "start"]

