import fs from 'fs'
import path from 'path'
import l from '../../../common/logger'
import walletService from '../common/walletService'

const rootPath = path.join(process.cwd())

class ChannelService {
  async createChannel (channelName, channelConfigPath, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      const envelope = fs.readFileSync(path.join(rootPath, channelConfigPath))
      const channelConfig = client.extractChannelConfig(envelope)

      let signature = client.signChannelConfig(channelConfig)

      let request = {
        config: channelConfig,
        signatures: [signature],
        name: channelName,
        txId: client.newTransactionID(true)
      }

      const result = await client.createChannel(request)
      let response

      if (result) {
        if (result.status === 'SUCCESS') {
          response = {
            success: true,
            message: 'Channel \'' + channelName + '\' created Successfully',
          }
        } else {
          response = {
            success: false,
            message: 'Channel \'' + channelName + '\' failed to create',
            status: result.status,
            detail: result.info
          }
        }
      } else {
        response = {
          success: false,
          message: 'Failed to create the channel \'' + channelName + '\''
        }
      }
      return response
    } catch (err) {
      l.error('Failed to create the channel : ' + err.stack ? err.stack : err)
      throw new Error('Failed to create the channel : ' + err.toString())
    }
  }
  async joinChannel (channelName, peers, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      const channel = client.getChannel(channelName)
      // await channel.initialize({ asLocalhost: false })

      let blockRequest = {
        txId: client.newTransactionID(true)
      }
      let genesisBlock = await channel.getGenesisBlock(blockRequest)

      let joinRequest = {
        targets: peers,
        txId: client.newTransactionID(true),
        block: genesisBlock
      }
      let joinResults = await channel.joinChannel(joinRequest)
      let responseMessages = []
      let success = true

      for (const i in joinResults) {
        let errorMessage
        let resultMessage

        if (joinResults[i] instanceof Error && joinResults[i].isProposalResponse) {
          errorMessage = {
            code: joinResults[i].status,
            message: joinResults[i].message,
            targetPeer: joinResults[i].peer
          }
        } else if (joinResults[i] instanceof Error && joinResults[i].code === 2) {
          errorMessage = {
            code: joinResults[i].code,
            message: joinResults[i].details
          }
        } else if (joinResults[i].response && joinResults[i].response.status === 200) {
          // l.info('Successfully joined peer to the channel : ' + channelName)
        } else {
          errorMessage = {
            message: 'Failed to join peer to the channel : ' + channelName,
            targetPeer: joinResults[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: success,
            message: 'Successfully joined peer in organization \'' + mspId + '\' to the channel \'' + channelName
          }
          // l.info(message)
        } else {
          success = false
          resultMessage = {
            success: success,
            message: 'Failed to join peer to channel',
            detail: errorMessage
          }
        }
        responseMessages.push(resultMessage)
      }

      const response = {
        success: success,
        message: responseMessages
      }
      return response
    } catch (err) {
      l.error('Failed join peers to channel : ' + err.stack ? err.stack : err)
      throw new Error('Failed join peers to channel : ' + err.toString())
    }
  }

  async updateChannel (channelName, channelConfigPath, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      const envelope = fs.readFileSync(path.join(rootPath, channelConfigPath))
      const channelConfig = client.extractChannelConfig(envelope)

      let signature = client.signChannelConfig(channelConfig)

      let request = {
        config: channelConfig,
        signatures: [signature],
        name: channelName,
        txId: client.newTransactionID(true)
      }

      const result = await client.updateChannel(request)
      let response

      if (result) {
        if (result.status === 'SUCCESS') {
          response = {
            success: true,
            message: 'Channel \'' + channelName + '\' updated Successfully',
          }
        } else {
          response = {
            success: false,
            message: 'Channel \'' + channelName + '\' failed to update',
            status: result.status,
            detail: result.info
          }
        }
      } else {
        response = {
          success: false,
          message: 'Failed to update channel \'' + channelName + '\''
        }
      }
      return response
    } catch (err) {
      l.error('Failed to update channel: ' + err.stack ? err.stack : err)
      throw new Error('Failed to update channel: ' + err.toString())
    }
  }
}

export default new ChannelService()
