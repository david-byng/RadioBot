PASSWORD=swordfish
DIR=$(shell pwd)
NGINXPORT=8064
COUCHPORT=5984

default: install start

install:
	@npm install; \
	${DIR}/node_modules/bower/bin/bower install;

start: gulp nginx couchdb
	@echo; \
    echo "By default:"; \
    echo "Nginx is hosted on http://localhost:${NGINXPORT}"; \
    echo "Couch is hosted on http://localhost:${COUCHPORT}"; \
    echo "Couch user is 'admin', password is '${PASSWORD}'";

gulp:
	@echo -n ""; # noop

nginx:
	@echo "Checking for nginx..." && \
	if [ `docker ps | grep radiobotnginx | wc -l | tr -d " \n"` -eq 0 ]; \
	then \
	    echo "Starting nginx..." && \
	    docker run -d -p ${NGINXPORT}:80 -v ${DIR}/www:/usr/share/nginx/html:ro --name radiobotnginx nginx; \
	else \
	    echo "Nginx already running."; \
	fi;

couchdb:
	@echo "Checking for couchdb..." && \
	if [ `docker ps | grep radiobotcouchdb | wc -l | tr -d " \n"` -eq 0 ]; \
	then \
	    echo "Starting couchdb..." && \
	    docker run -d -p ${COUCHPORT}:5984 -v ${DIR}/data/couchdb:/usr/local/var/lib/couchdb --name radiobotcouchdb klaemo/couchdb && \
	    echo -n "Waiting for couch to start..." && \
	    until curl --silent -X GET http://localhost:${COUCHPORT}/_all_dbs > /dev/null; do echo -n "."; sleep 0.5; done; \
        echo; \
        curl --silent -X GET http://localhost:${COUCHPORT}/_all_dbs; \
	    echo; \
	    echo "Checking for admin user..."; \
	    if [ `curl --silent -X GET http://localhost:${COUCHPORT}/_config/admin | grep "unauthorized" | wc -l | tr -d " \n"` -lt 1 ]; \
	    then \
	        echo "Creating admin user..."; \
	        curl --silent -X PUT http://localhost:${COUCHPORT}/_config/admins/admin -d '"${PASSWORD}"'; \
	    fi; \
	    echo "Checking for database..." && \
	    if [ `curl --silent -X GET http://localhost:${COUCHPORT}/_all_dbs | grep "radiobot" | wc -l | tr -d " \n"` -eq 0 ]; \
	    then \
	        echo "Creating database..."; \
	        curl --silent -X PUT http://admin:${PASSWORD}@localhost:${COUCHPORT}/radiobot; \
	    fi; \
	else \
	    echo "Couchdb already running."; \
	fi;

clean:
	@echo "Stopping nginx.."; \
    docker stop radiobotnginx >/dev/null; \
    echo "Removing nginx.."; \
	docker rm radiobotnginx >/dev/null; \
    echo "Stopping couchdb.."; \
	docker stop radiobotcouchdb >/dev/null; \
    echo "Removing couchdb.."; \
	docker rm radiobotcouchdb >/dev/null; \
    echo "Removing data.."; \
	rm -rvf ./data/couchdb/*; \
