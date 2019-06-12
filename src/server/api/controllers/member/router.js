import * as express from 'express'
import transaction from './transactionController'

export default express
  .Router()
  .post('/queryChaincode', transaction.queryChaincode)
  .post('/invokeChaincode', transaction.invokeChaincode)
  .post('/queryBlockByNumber', transaction.queryBlockByNumber)
  .post('/queryTransactionById', transaction.queryTransactionById)
  .post('/queryBlockByHash', transaction.queryBlockByHash)
  .post('/queryChainInfo', transaction.queryChainInfo)
  .post('/queryInstalledChaincodes', transaction.queryInstalledChaincodes)
  .post('/queryInstantiatedChaincodes', transaction.queryInstantiatedChaincodes)
  .post('/queryChannels', transaction.queryChannels)
