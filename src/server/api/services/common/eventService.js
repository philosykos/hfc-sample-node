import l from '../../../common/logger'

class EventService {
  async getTxEvent (channel, txId) {
    let eventHubs = channel.getChannelEventHubsForOrg()
    let promises = []
    let success = true

    eventHubs.forEach((eh) => {
      let txEventPromise = new Promise((resolve, reject) => {
        let eventTimeout = setTimeout(() => {
          let eventMessage = 'REQUEST_TIMEOUT:' + eh.getPeerAddr()
          l.error(eventMessage)
          eh.disconnect()
        }, 3000)
        eh.registerTxEvent(txId.getTransactionID(), (tx, code, blockNum) => {
          clearTimeout(eventTimeout)
          let commitReponse
          let message
          if (code !== 'VALID') {
            success = false
            message = 'The transaction was invalid'
            l.error(message)
            commitReponse = {
              success: success,
              message: message,
              code: code,
              blockNum: blockNum,
              peerAddr: eh.getPeerAddr()
            }
          } else {
            message = 'The transaction was valid'
            // l.info(message)
            commitReponse = {
              success: success,
              message: message,
              code: code,
              blockNum: blockNum,
              peerAddr: eh.getPeerAddr()
            }
          }
          resolve(commitReponse)
        }, (err) => {
          clearTimeout(eventTimeout)
          l.error(err)
          reject(err)
        }, { unregister: true, disconnect: true }
        )
        eh.connect()
      })
      promises.push(txEventPromise)
    })

    let responses = await Promise.all(promises)

    let result = {
      success: success,
      txEvents: responses
    }
    return result
  }
}
export default new EventService()
