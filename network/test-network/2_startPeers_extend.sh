#!/bin/bash

echo "===================== Start additional peers ====================="
docker-compose -f docker-compose-extend.yaml up -d
