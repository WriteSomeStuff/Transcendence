FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY services/routing ./services/routing

RUN npm install --omit=dev -w routing

CMD npm run up -w routing
