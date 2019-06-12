#!/bin/bash

echo "===================== Chaincode container launching by query ====================="
docker exec -e CORE_PEER_ADDRESS=skcc_peer3:9051 skcc_cli peer chaincode query -C skcc-channel2 -n sample2 -c '{"Args":["query","skcc_user1"]}'

echo -e "\n===================== Chaincode container launching by query ====================="
docker exec -e CORE_PEER_ADDRESS=contractor1_peer3:12051 contractor1_cli peer chaincode query -C skcc-channel2 -n sample2 -c '{"Args":["query","contractor1_user1"]}'
