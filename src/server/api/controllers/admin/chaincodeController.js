import chaincodeService from '../../services/admin/chaincodeService'
import l from '../../../common/logger'

export class ChaincodeController {
  async installChaincode (req, res) {
    try {
      let message = await chaincodeService.installChaincode(req.body['peers'], req.body['chaincodeName'], req.body['chaincodePath'], req.body['chaincodeVersion'], req.body['chaincodeType'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async installChaincodePackage (req, res) {
    try {
      let message = await chaincodeService.installChaincodePackage(req.body['peers'], req.body['chaincodeName'], req.body['chaincodePath'], req.body['chaincodeVersion'], req.body['chaincodeType'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async instantiateChaincode (req, res) {
    try {
      let message = await chaincodeService.instantiateChaincode(req.body['peers'], req.body['channelName'], req.body['chaincodeName'], req.body['chaincodeVersion'], req.body['chaincodeType'], req.body['fcn'], req.body['args'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async upgradeChaincode (req, res) {
    try {
      let message = await chaincodeService.upgradeChaincode(req.body['peers'], req.body['channelName'], req.body['chaincodeName'], req.body['chaincodeVersion'], req.body['chaincodeType'], req.body['fcn'], req.body['args'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
}
export default new ChaincodeController()
