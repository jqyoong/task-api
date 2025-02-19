NAME=task-api
BREWS=postgres
APPNAME := task-api

rm-eslintcache:
	if [ -a .eslintcache ]; then rm .eslintcache; fi

rm-node-modules:
	if [ -a node_modules ]; then rm -rf node_modules; fi

i:
	npm i

gen-dockercompose:
	$(shell sed -e 's|NAME_CONTAINER|'"$(APPNAME)"'|g' docker-compose.yml.template > docker-compose.yml)

wait-for-db:
	@echo "Waiting for database to be ready..."
	@until docker exec $(APPNAME)-db-primary pg_isready; do \
		echo "Database is unavailable - installing"; \
		sleep 2; \
	done
	@echo "Database is ready!"

up: gen-dockercompose
	docker compose -p $(APPNAME) up -d --remove-orphans
	make wait-for-db
	npm run migrate:db


down: gen-dockercompose
	 docker compose -p $(APPNAME) down --remove-orphans
	 if [ -a docker-compose.yml ]; then rm docker-compose.yml; fi

reset:
	make down
	make up

start:
	npm start

init:
	asdf install
	brew install postgresql
	make i
	make up

npm-clean-install: rm-eslintcache rm-node-modules i


.PHONY: init i up down
.SILENT: init i up down
