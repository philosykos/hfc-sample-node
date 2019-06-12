import l from '../../../common/logger'
import walletService from '../../services/common/walletService'

export class WalletController {
  async createWallet (req, res) {
    try {
      await walletService.createWallet(req.query['mspId'], req.query['userName'])
      l.info('Successfully create a wallet from crypto material')
      res.status(200).send({ success: true })
    } catch (err) {
      l.error(err.message)
      res.status(500).send({ success: false, errorStatus: { code: '000', message: err.message } })
    }
  }
}
export default new WalletController()
