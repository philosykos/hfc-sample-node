import * as express from 'express'
import sample from './sampleController'

export default express
  .Router()
  .get('/queryWithRolling', sample.queryWithRolling)
  .get('/queryWithDiscovery', sample.queryWithDiscovery)
  .get('/queryWithContract', sample.queryWithContract)
  .post('/invokeWithContract', sample.invokeWithContract)
