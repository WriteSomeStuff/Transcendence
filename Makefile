all:
	docker compose up --build

down:
	docker compose down

prune:
	docker builder prune -f && docker system prune -af

status:
	docker compose ps

.PHONY: all down prune status