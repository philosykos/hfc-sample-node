import transactionService from '../../services/member/transactionService'
import l from '../../../common/logger'

export class TransactionController {
  async queryChaincode (req, res) {
    try {
      let message = await transactionService.queryChaincode(req.body['peers'], req.body['channelName'], req.body['chaincodeName'], req.body['fcn'], req.body['args'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async invokeChaincode (req, res) {
    try {
      let message = await transactionService.invokeChaincode(req.body['peers'], req.body['channelName'], req.body['chaincodeName'], req.body['fcn'], req.body['args'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryBlockByNumber (req, res) {
    try {
      let message = await transactionService.queryBlockByNumber(req.body['peer'], req.body['channelName'], req.body['blockNumber'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryTransactionById (req, res) {
    try {
      let message = await transactionService.queryTransactionById(req.body['peer'], req.body['channelName'], req.body['txId'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryBlockByHash (req, res) {
    try {
      let message = await transactionService.queryBlockByHash(req.body['peer'], req.body['channelName'], req.body['blockHash'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryChainInfo (req, res) {
    try {
      let message = await transactionService.queryChainInfo(req.body['peer'], req.body['channelName'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryInstalledChaincodes (req, res) {
    try {
      let message = await transactionService.queryInstalledChaincodes(req.body['peer'], req.body['channelName'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryInstantiatedChaincodes (req, res) {
    try {
      let message = await transactionService.queryInstantiatedChaincodes(req.body['peer'], req.body['channelName'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryChannels (req, res) {
    try {
      let message = await transactionService.queryChannels(req.body['peer'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
}
export default new TransactionController()
