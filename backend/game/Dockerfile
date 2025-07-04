FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/pong ./shared/pong
COPY backend/game ./backend/game

RUN npm install --omit=dev
RUN npm install -w game

CMD npm run up -w game
