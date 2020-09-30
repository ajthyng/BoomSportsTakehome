FROM node:alpine as build

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN tsc -p ./

FROM node:alpine

WORKDIR /usr/app

COPY --from=build package.json ./
COPY --from=build dist ./dist

RUN npm install --production

ENTRYPOINT [ "npm" ]
CMD [ "start" ]