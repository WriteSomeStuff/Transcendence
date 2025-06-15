FROM node:20-alpine AS builder

WORKDIR /app
COPY ../package.json ../tsconfig.base.json ./
COPY ../shared/pong ./shared/pong
COPY ./ ./frontend

WORKDIR /app/frontend

RUN corepack enable && corepack prepare --activate
RUN npm install --production --omit=dev
RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/frontend/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
