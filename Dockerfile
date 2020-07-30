FROM node:12-alpine

RUN mkdir -p /home/node/chatty-server/node_modules && chown -R node:node /home/node/chatty-server
WORKDIR /home/node/chatty-server
COPY package*.json ./
USER node
RUN npm install
COPY . .
ENV NODE_ENV production
RUN npm run build
EXPOSE 4575
CMD [ "npm", "start" ]