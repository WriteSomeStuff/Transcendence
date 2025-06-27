all:
	mkdir -p ./backend/authentication/data/database
	mkdir -p ./backend/userManagement/data/database
	mkdir -p ./backend/userManagement/data/avatars/user_uploads
	docker compose up --build

down:
	docker compose down

prune:
	docker builder prune -f && docker system prune -af

status:
	docker compose ps

clean_db:
	find ./backend -type f -name "*.sqlite3" -delete

clean_avatars:
	docker volume rm transcendence_git_avatars || true
	rm -rf ./backend/userManagement/data/avatars/user_uploads

clean_users: down clean_db clean_avatars

clean_volume: down
	docker volume rm transcendence_git_auth_db transcendence_git_avatars transcendence_git_user_db || true

.PHONY: all down prune status clean_db clean_avatars clean_users clean_volume
