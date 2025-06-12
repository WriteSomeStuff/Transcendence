all:
	npm run build
	docker build -t match_making .
	docker run -p 8080:8080 match_making 

testLocal :
	@mkdir -p dist/
	@cp -r src/public dist/
	npm run test

testDocker:
	@mkdir -p dist/
	@cp -r src/public dist/
	npm run build
	docker build -t match_making .
	docker run -p 8080:8080 match_making

re: fclean test

fclean: 
	rm -rf dist


dockerClean:
	@-docker stop $$(docker ps -aq) 2>/dev/null || true
	@-docker rm $$(docker ps -aq) 2>/dev/null || true
	@-docker rmi -f $$(docker images -q) 2>/dev/null || true
