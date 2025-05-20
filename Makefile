NAME= inception

all:
# 	mkdir -p ${HOME}/inception
# 	mkdir -p ${HOME}/inception/db
# 	mkdir -p ${HOME}/inception/wp
	docker compose -f docker-compose.yml up

# prep:
# 	echo "127.0.0.1 cschabra.42.fr" | sudo tee -a /etc/hosts > /dev/null

down:
	docker compose -f docker-compose.yml down

prune:
	docker builder prune -f && docker system prune -a -f
#	sudo rm -rf ${HOME}/inception

status:
	docker compose -f docker-compose.yml ps

.PHONY: all prep down prune status