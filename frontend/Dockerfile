FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared ./shared
COPY frontend ./frontend

RUN npm install --omit=dev
RUN npm install typescript
RUN npm run build -w frontend

FROM nginx:alpine

COPY --from=builder /app/frontend/public /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
