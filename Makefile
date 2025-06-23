all:
	mkdir -p ./backend/authentication/data
	mkdir -p ./backend/userManagement/data
	mkdir -p ./frontend/src/public/assets/avatars/user
	docker compose up --build

down:
	docker compose down

prune:
	docker builder prune -f && docker system prune -af

status:
	docker compose ps

db_clean:
	find ./backend -type f -name "*.sqlite3" -delete

.PHONY: all down prune status db_clean
