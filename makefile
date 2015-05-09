SHELL=/bin/bash
PASSWORD=swordfish
DIR=$(shell pwd)
NGINXPORT=8064
HOSTNAME=$(shell if hash boot2docker 2>/dev/null; then boot2docker ip; else echo localhost; fi)
UUID=$(shell uuidgen)
DEFAULTS=swordfish80645984$(shell if hash boot2docker 2>/dev/null; then boot2docker ip; else echo localhost; fi)

default: install start

install:
	@npm install; \
	${DIR}/node_modules/bower/bin/bower install;

start: gulp couchdb nginx useage

useage:
	@echo; \
    if test "${DEFAULTS}" == "${PASSWORD}${NGINXPORT}${HOSTNAME}" ; \
    then \
         echo "By default:"; \
    fi; \
    echo "Nginx is hosted on http://${HOSTNAME}:${NGINXPORT}"; \
    echo "Couch user is 'admin', password is '${PASSWORD}'";

gulp:
	@echo -n "Running gulp scripts..."; \
    rand=`uuidgen`; \
    node_modules/gulp/bin/gulp.js > /tmp/$${rand}_gulp 2>&1; \
    if [[ $$? -ne 0 ]]; \
    then \
        echo "ERR"; \
        cat /tmp/$${rand}_gulp; \
    else \
        echo "OK"; \
    fi; \
    touch /tmp/$${rand}_gulp; \
    rm /tmp/$${rand}_gulp;

couchdb: couchdb-start nginx
	@echo -n "Waiting for couch to start..."; \
	until curl --silent -X GET http://${HOSTNAME}:${NGINXPORT}/couchdb/_all_dbs > /dev/null; do echo -n "."; sleep 0.5; done; \
	echo; \
	echo "Checking for admin user..."; \
	if ! curl --silent -X GET http://${HOSTNAME}:${NGINXPORT}/couchdb/_config/admin | grep -q "unauthorized"; \
	then \
	    echo "Creating admin user..."; \
	    curl --silent -X PUT http://${HOSTNAME}:${NGINXPORT}/couchdb/_config/admins/admin -d '"${PASSWORD}"'; \
	fi; \
	echo "Checking for database..." && \
	if ! curl --silent -X GET http://${HOSTNAME}:${NGINXPORT}/couchdb/_all_dbs | grep -q "radiobot"; \
	then \
	    echo "Creating database..."; \
	    curl --silent -X PUT http://admin:${PASSWORD}@${HOSTNAME}:${NGINXPORT}/couchdb/radiobot; \
	fi;

couchdb-start:
	@echo -n "Checking for couchdb..." && \
	if ! docker ps | grep -q radiobotcouchdb; \
	then \
        echo "Not started"; \
	    echo "Starting couchdb..."; \
	    docker run -d -v ${DIR}/data/couchdb:/usr/local/var/lib/couchdb --name radiobotcouchdb klaemo/couchdb; \
	else \
	    echo "OK"; \
	fi;

nginx:
	@echo -n "Checking for nginx..."; \
	if ! docker ps | grep -q radiobotnginx; \
	then \
        echo "Not started"; \
		echo "Starting nginx..."; \
		docker run -d -p ${NGINXPORT}:80 --link radiobotcouchdb:couch -v ${DIR}/www:/usr/share/nginx/html:ro -v ${DIR}/config/default.conf:/etc/nginx/conf.d/default.conf:ro --name radiobotnginx nginx; \
	else \
        echo "OK"; \
	fi; \
	echo -n "Checking if nginx is up to date..."; \
	if ! docker exec radiobotnginx cat /etc/nginx/conf.d/default.conf | grep -q couchdb; \
	then \
		echo "needs upgrading."; \
		make clean-nginx; \
		make nginx; \
    else \
        echo "OK"; \
	fi;

clean: clean-nginx clean-couch
	@echo "Removing data.."; \
	rm -rvf ./data/couchdb/*; 

clean-nginx:
	@echo -n "Stopping nginx..."; \
    if docker ps | grep -q radiobotnginx; \
    then \
        docker stop radiobotnginx >/dev/null; \
        echo "OK"; \
    else \
        echo "Not started"; \
    fi; \
    echo -n "Removing nginx.."; \
    if docker ps -a | grep -q radiobotnginx; \
    then \
        docker rm radiobotnginx >/dev/null; \
        echo "OK"; \
    else \
        echo "Not found"; \
    fi; 

clean-couch:
	@echo -n "Stopping couchdb..."; \
    if docker ps | grep -q radiobotcouchdb; \
    then \
        docker stop radiobotcouchdb >/dev/null; \
        echo "OK"; \
    else \
        echo "Not started"; \
    fi; \
    echo -n "Removing couchdb..."; \
    if docker ps -a | grep -q radiobotcouchdb; \
    then \
        docker rm radiobotcouchdb >/dev/null; \
        echo "OK"; \
    else \
        echo "Not found"; \
    fi; \
