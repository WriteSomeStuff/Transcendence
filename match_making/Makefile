#grab the matchmaking port from the .env file
MATCH_MAKING_PORT := $(shell grep MATCH_MAKING_PORT ../.env | cut -d= -f2 | tr -d ' ' || echo 8080)

# TODO
all:
	@echo "does NOT run yet because the service that provides the pages is not yet live. use testDocker or testLocal instead" 
	# npm run build
	# docker build -t match_making .
	# docker run -p $(MATCH_MAKING_PORT):$(MATCH_MAKING_PORT) match_making 

testLocal :
	@mkdir -p dist/
	cp -r src/public dist/
	npm run test

testDocker:
	@echo "Using MATCH_MAKING_PORT: $(MATCH_MAKING_PORT)"
	@mkdir -p dist/
	@cp -r src/public dist/
	npm run build
	docker build -t match_making .
	docker run --name match_making -p $(MATCH_MAKING_PORT):$(MATCH_MAKING_PORT) --env-file ../.env match_making

re: fclean test

fclean: 
	rm -rf dist

dockerStop:
	docker stop $$(docker ps -q)
	make dockerClean

dockerClean:
	@-docker stop $$(docker ps -aq) 2>/dev/null || true
	@-docker rm $$(docker ps -aq) 2>/dev/null || true
	@-docker rmi -f $$(docker images -q) 2>/dev/null || true
