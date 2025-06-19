all:
	mkdir -p ./backend/authentication/data
	mkdir -p ./backend/userManagement/data
	mkdir -p ./frontend/src/public/assets/user
	docker compose up --build

down:
	docker compose down

prune:
	docker builder prune -f && docker system prune -af

status:
	docker compose ps

.PHONY: all down prune status