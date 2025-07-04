FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY backend/authentication ./backend/authentication

RUN npm install --omit=dev -w authentication

ENV JWT_SECRET="my_secret"
CMD npm run up -w authentication
