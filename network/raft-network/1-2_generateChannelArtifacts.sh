#!/bin/bash
export PATH=$GOPATH/src/github.com/hyperledger/fabric/.build/bin:${PWD}/../bin:${PWD}:$PATH
CHANNEL_NAME=skcc-channel
CHANNEL2_NAME=skcc-channel2

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


configtxgen -profile TwoOrgsRaftChannel -outputCreateChannelTx ./config/$CHANNEL2_NAME.tx -channelID $CHANNEL2_NAME
configtxgen -profile TwoOrgsRaftChannel -outputAnchorPeersUpdate ./config/skccAnchors_ch2.tx -channelID $CHANNEL2_NAME -asOrg skcc
configtxgen -profile TwoOrgsRaftChannel -outputAnchorPeersUpdate ./config/contractor1Anchors_ch2.tx -channelID $CHANNEL2_NAME -asOrg contractor1

configtxgen -profile TwoOrgsRaftChannel -outputCreateChannelTx ./config/skccChannel.tx -channelID skccChannel
