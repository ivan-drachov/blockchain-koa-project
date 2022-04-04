#!/bin/bash

set -e

while ! (timeout 3 bash -c "</dev/tcp/${DB_HOST}/${DB_PORT}") &> /dev/null;
do
    echo waiting for PostgreSQL to start...;
    sleep 3;
done;

yarn install

sequelize db:migrate

if [ "$ENV" = "prod" ]
then
  npm run build
  npm start
else
  npm run start-dev
fi

