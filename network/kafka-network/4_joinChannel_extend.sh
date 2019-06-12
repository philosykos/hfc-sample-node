#!/bin/bash

echo "===================== Fetch Genesis Block ====================="
docker exec skcc_cli peer channel fetch 0 skcc-channel2.block -o chainz_orderer1:6050 -c skcc-channel2 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/chainz/orderers/chainz_orderer1/tls/ca.crt

echo -e "\n===================== Fetch Genesis Block ====================="
docker exec contractor1_cli peer channel fetch 0 skcc-channel2.block -o chainz_orderer1:6050 -c skcc-channel2 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/chainz/orderers/chainz_orderer1/tls/ca.crt

echo "===================== Join skcc_peer3 to the channel ====================="
docker exec -e CORE_PEER_ADDRESS=skcc_peer3:9051 skcc_cli peer channel join -b skcc-channel2.block

echo "===================== Join contractor1_peer3 to the channel ====================="
docker exec -e CORE_PEER_ADDRESS=contractor1_peer3:12051 contractor1_cli peer channel join -b skcc-channel2.block
