#!/bin/bash
set -ev

docker-compose -f docker-compose.yaml kill && docker-compose -f docker-compose.yaml down --remove-orphans

# remove chaincode docker images
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
