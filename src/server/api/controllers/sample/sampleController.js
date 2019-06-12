import sampleService from '../../services/sample/sampleService'
import FabricClient from '../../services/common/fabricClient'
import l from '../../../common/logger'

const fabricClient = new FabricClient()
fabricClient.initialize()

export class SampleController {
  async queryWithRolling (req, res) {
    try {
      let message = await sampleService.queryWithRolling(req.query['userId'], fabricClient._user.client)
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryWithDiscovery (req, res) {
    try {
      let message = await sampleService.queryWithDiscovery(req.query['userId'], fabricClient._user.client)
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async queryWithContract (req, res) {
    try {
      let message = await sampleService.queryWithContract(req.query['userId'], fabricClient._user.gateway)
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async invokeWithContract (req, res) {
    try {
      let message = await sampleService.invokeWithContract(req.query['from'], req.query['to'], req.query['value'], fabricClient._user.gateway)
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
}
export default new SampleController()
