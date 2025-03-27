FROM node AS frontend_build

WORKDIR /app

COPY src src
COPY public public
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY tsconfig.json tsconfig.json

RUN corepack enable && corepack prepare --activate
RUN pnpm install
RUN pnpm run build


FROM nginx

COPY --from=frontend_build /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
