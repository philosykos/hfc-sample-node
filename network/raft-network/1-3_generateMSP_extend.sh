#!/bin/bash
export PATH=$GOPATH/src/github.com/hyperledger/fabric/.build/bin:${PWD}/../bin:${PWD}:$PATH

echo "===================== generate crypto material for additional peers ====================="
cryptogen extend --input="crypto-config" --config=crypto-config.yaml
