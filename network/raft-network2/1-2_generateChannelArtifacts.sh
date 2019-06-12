#!/bin/bash
export PATH=$GOPATH/src/github.com/hyperledger/fabric/.build/bin:${PWD}/../bin:${PWD}:$PATH
CHANNEL_NAME=skcc-channel

# remove config transactions
rm -fr config/*

echo "===================== generate genesis block for orderer ====================="
configtxgen -profile TwoOrgsRaftGenesis -outputBlock ./config/genesis.block

echo "===================== generate channel configuration transaction ====================="
configtxgen -profile TwoOrgsRaftChannel -outputCreateChannelTx ./config/$CHANNEL_NAME.tx -channelID $CHANNEL_NAME

echo "===================== generate anchor peer transaction ====================="
configtxgen -profile TwoOrgsRaftChannel -outputAnchorPeersUpdate ./config/skccAnchors.tx -channelID $CHANNEL_NAME -asOrg skcc

echo "===================== generate anchor peer transaction ====================="
configtxgen -profile TwoOrgsRaftChannel -outputAnchorPeersUpdate ./config/contractor1Anchors.tx -channelID $CHANNEL_NAME -asOrg contractor1
