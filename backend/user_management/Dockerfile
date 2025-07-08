FROM node:20-alpine3.22

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY backend/user_management ./backend/user_management

RUN npm install --omit=dev
RUN npm install -w user_management

RUN mkdir -p /data
RUN mkdir -p /app/data/avatars/user_uploads

CMD npm run up -w user_management
