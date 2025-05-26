FROM nginx:alpine

RUN	apk add --no-cache openssl && \
	mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes \
	-subj "/C=NL/ST=Noord-Holland/L=Amsterdam/O=Chey/OU=Unit1/CN=cschabra.42.fr/UID=cschabra" \ 
	-out /etc/nginx/ssl/new.crt \
	-keyout /etc/nginx/ssl/new.key

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./index.html /etc/nginx/html/index.html

WORKDIR	/etc/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]