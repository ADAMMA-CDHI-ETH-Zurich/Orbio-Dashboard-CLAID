FROM node:17.8-alpine AS base

COPY . /srv

WORKDIR /srv

RUN npm install && npm install -g serve && npm run build

CMD ["serve", "-s", "build", "-l", "3000"]