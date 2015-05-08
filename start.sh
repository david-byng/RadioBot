#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

echo "Checking for couchdb..." &&
if [ `docker ps | grep radiobotcouchdb | wc -l | tr -d " \n"` -eq 0 ];
then
    echo "Starting couchdb..." &&
    docker run -d -p 5984:5984 -v $DIR/data/couchdb:/usr/local/var/lib/couchdb --name radiobotcouchdb klaemo/couchdb &&
    echo -n "Waiting for couch to start..." &&
    until curl --silent -X GET http://localhost:5984/_all_dbs > /dev/null; do echo -n "."; sleep 0.5; done;
    echo &&
    echo "Checking for admin user..." &&
    if [ `curl --silent -X GET http://localhost:5984/_config/admin | grep "unauthorized" | wc -l | tr -d " \n"` -lt 1 ];
    then
        echo "Creating admin user..." &&
        curl --silent -X PUT http://localhost:5984/_config/admins/admin -d '"swordfish"' >/dev/null;
    fi;
    echo "Checking for database..." &&
    if [ `curl --silent -X GET http://localhost:5984/_all_dbs | grep "radiobot" | wc -l | tr -d " \n"` -eq 0 ];
    then
        echo "Creating database..." &&
        curl --silent -X PUT http://admin:swordfish@localhost:5984/radiobot > /dev/null;
    fi;
else
    echo "Couchdb already running.";
fi;

echo "Checking for nginx..." &&
if [ `docker ps | grep radiobotnginx | wc -l | tr -d " \n"` -eq 0 ];
then
    echo "Starting nginx..." &&
    docker run -d -p 8064:80 -v $DIR/www:/usr/share/nginx/html:ro --name radiobotnginx nginx;
else
    echo "Nginx already running.";
fi;
