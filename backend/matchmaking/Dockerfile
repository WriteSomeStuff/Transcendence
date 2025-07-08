FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/schemas ./shared/schemas
COPY backend/matchmaking ./backend/matchmaking

RUN npm install --omit=dev
RUN npm install -w matchmaking

CMD npm run up -w matchmaking
