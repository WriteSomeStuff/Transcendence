FROM node:20-alpine3.22 AS builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/pong ./shared/pong
COPY frontend ./frontend

RUN npm install --omit=dev
RUN npm install -w frontend
RUN npm run build -w frontend

FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
