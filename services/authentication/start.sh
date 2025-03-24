#!/usr/bin/env sh

docker build . -t transcendence_auth
docker run -p 8080:8080 -it transcendence_auth:latest
