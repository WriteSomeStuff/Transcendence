ARG NODE_VERSION=24.0.1

FROM node:${NODE_VERSION}-slim AS frontend_build

WORKDIR /app

COPY src src

RUN (cd src && npm i && npm run build && npx tailwindcss -i ./public/css/home.css -o ./public/css/output.css)

FROM nginx:alpine

RUN	apk add --no-cache openssl && \
	mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes \
	-subj "/C=NL/ST=Noord-Holland/L=Amsterdam/O=Chey/OU=Unit1/CN=cschabra.42.fr/UID=cschabra" \ 
	-out /etc/nginx/ssl/new.crt \
	-keyout /etc/nginx/ssl/new.key

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=frontend_build /app/src/index.html /etc/nginx/html/index.html
COPY --from=frontend_build /app/src/public /etc/nginx/html/public

WORKDIR	/etc/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]