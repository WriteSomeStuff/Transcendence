FROM node:20-alpine3.22 AS builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/ ./shared/
COPY frontend ./frontend

RUN npm install --omit=dev
RUN npm install -w frontend
RUN npm run build -w frontend
# TODO restore tailwind build

FROM nginx:alpine

RUN	apk add --no-cache openssl && \
	mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes \
	-subj "/C=NL/ST=Noord-Holland/L=Amsterdam/O=Chey/OU=Unit1/CN=cschabra.42.fr/UID=cschabra" \
	-out /etc/nginx/ssl/new.crt \
	-keyout /etc/nginx/ssl/new.key

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf

WORKDIR	/etc/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
