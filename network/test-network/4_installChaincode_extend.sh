#!/bin/bash

echo "===================== Install chaincode in skcc_peer3 ====================="
docker exec -e CORE_PEER_ADDRESS=skcc_peer3:9051 skcc_cli peer chaincode install -n sample2 -v 1.0 -l golang /opt/gopath/src/github.com/chaincode/sample2/sample2.cds

echo -e "\n===================== Install chaincode in contractor1_peer3 ====================="
docker exec -e CORE_PEER_ADDRESS=contractor1_peer3:12051 contractor1_cli peer chaincode install -n sample2 -v 1.0 -l golang /opt/gopath/src/github.com/chaincode/sample2/sample2.cds
