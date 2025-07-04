FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY backend/matchmaking ./backend/matchmaking

RUN npm install --omit=dev -w matchmaking

CMD npm run up -w matchmaking
