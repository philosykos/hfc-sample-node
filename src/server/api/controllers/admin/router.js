import * as express from 'express'
import channel from './channelController'
import chaincode from './chaincodeController'

export default express
  .Router()
  .post('/createChannel', channel.createChannel)
  .post('/joinChannel', channel.joinChannel)
  .post('/updateChannel', channel.updateChannel)
  .post('/installChaincode', chaincode.installChaincode)
  .post('/installChaincodePackage', chaincode.installChaincodePackage)
  .post('/instantiateChaincode', chaincode.instantiateChaincode)
  .post('/upgradeChaincode', chaincode.upgradeChaincode)
