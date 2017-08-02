FROM node:6.11.1

WORKDIR /dbuild

COPY . /dbuild

RUN npm install

EXPOSE 4200

CMD ["npm", "start"]