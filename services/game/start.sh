#!/usr/bin/env sh

docker build . -t transcendence_game
docker run -p 8080:8080 -it transcendence_game:latest
