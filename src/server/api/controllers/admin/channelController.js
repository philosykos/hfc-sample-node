import channelService from '../../services/admin/channelService'
import l from '../../../common/logger'

export class ChannelController {
  async createChannel (req, res) {
    try {
      let message = await channelService.createChannel(req.body['channelName'], req.body['channelConfigPath'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async joinChannel (req, res) {
    try {
      let message = await channelService.joinChannel(req.body['channelName'], req.body['peers'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
  async updateChannel (req, res) {
    try {
      let message = await channelService.updateChannel(req.body['channelName'], req.body['channelConfigPath'], req.body['mspId'], req.body['userName'])
      res.status(200).send(message)
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
}
export default new ChannelController()
