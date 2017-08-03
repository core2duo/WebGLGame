FROM node:6.11.1

WORKDIR /app

# Install app dependencies
# Docker will run npm install only if packages.json changes
COPY package.json /app
RUN npm install

# Bundle app source
COPY . /app

EXPOSE 3000
CMD ["npm", "start"]