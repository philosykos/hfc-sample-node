import * as express from 'express'
import wallet from './walletController'

export default express
  .Router()
  .get('/createWallet', wallet.createWallet)
