import walletService from './walletService'
import l from '../../../common/logger'

class FabricClient {
  constructor () {
    this._user = {}
    this._admin = {}
  }

  async initialize () {
    try {
      const mspId = process.env.MSP_ID
      const userId = process.env.USER_ID
      const adminUserId = process.env.ADMIN_USER_ID

      this._user.gateway = await walletService.getGatewayFromWallet(mspId, userId)
      this._user.client = this._user.gateway.getClient()
      this._admin.gateway = await walletService.getGatewayFromWallet(mspId, adminUserId)
      this._admin.client = this._admin.gateway.getClient()
    } catch (err) {
      l.error('Failed to initialize fabric client : ' + err.stack ? err.stack : err)
      throw new Error('Failed to initialize fabric client : ' + err.toString())
    }
  }
}
export default FabricClient
