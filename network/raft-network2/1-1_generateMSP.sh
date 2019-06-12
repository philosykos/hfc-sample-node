#!/bin/bash
export PATH=$GOPATH/src/github.com/hyperledger/fabric/.build/bin:${PWD}/../bin:${PWD}:$PATH

# remove previous crypto material
rm -fr crypto-config/*

echo "===================== generate crypto material ====================="
cryptogen generate --config=./crypto-config.yaml
