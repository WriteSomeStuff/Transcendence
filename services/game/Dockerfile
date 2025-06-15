FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/pong ./shared/pong
COPY services/game ./services/game

RUN npm install --omit=dev -w game

CMD npm run up -w game
