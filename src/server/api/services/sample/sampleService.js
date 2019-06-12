import transactionService from '../member/transactionService'
import l from '../../../common/logger'

class SampleService {
  async queryWithRolling (userId, client) {
    try {
      const queryData = await transactionService.queryWithRolling('skcc-channel2', 'sample2', 'query', [userId], client)
      let response

      response = {
        data: queryData.queryResults[0],
        targetPeer: queryData.targetPeer
      }

      return response
    } catch (err) {
      l.error('Failed to query user balance : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query user balance : ' + err.toString())
    }
  }
  async queryWithDiscovery (userId, client) {
    try {
      const queryData = await transactionService.queryWithDiscovery('skcc-channel2', 'sample2', 'query', [userId], client)
      let response

      response = {
        data: queryData
      }

      return response
    } catch (err) {
      l.error('Failed to query user balance : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query user balance : ' + err.toString())
    }
  }
  async queryWithContract (userId, gateway) {
    try {
      const queryData = await transactionService.queryWithContract('skcc-channel2', 'sample2', 'query', [userId], gateway)
      let response

      response = {
        data: queryData
      }

      return response
    } catch (err) {
      l.error('Failed to query user balance : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query user balance : ' + err.toString())
    }
  }
  async invokeWithContract (from, to, value, gateway) {
    try {
      const queryData = await transactionService.invokeWithContract('skcc-channel2', 'sample2', 'invoke', [from, to, value], gateway)
      let response

      response = {
        data: queryData
      }

      return response
    } catch (err) {
      l.error('Failed to query user balance : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query user balance : ' + err.toString())
    }
  }
}
export default new SampleService()
