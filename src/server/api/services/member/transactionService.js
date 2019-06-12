import l from '../../../common/logger'
import walletService from '../common/walletService'
import eventService from '../common/eventService'

class TransactionService {
  async queryChaincode (peers, channelName, chaincodeName, fcn, args, mspId, userName) {
    let channel = null
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      let queryRequest = {
        targets: peers,
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args
      }

      let queryResponses = await channel.queryByChaincode(queryRequest)
      let queryResults = []
      let query = true

      for (const i in queryResponses) {
        let errorMessage
        let resultMessage

        if (queryResponses[i] instanceof Error) {
          errorMessage = {
            code: queryResponses[i].status,
            message: queryResponses[i].message,
            targetPeer: queryResponses[i].peer
          }
        } else if (queryResponses[i]) {
          // l.info('instantiate proposal was good')
        } else {
          errorMessage = {
            message: 'query chaincode was bad for an unknown reason : ' + queryResponses[i],
            targetPeer: queryResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: query,
            message: 'Successfully get query response'
          }
          resultMessage.queryResponse = JSON.parse(queryResponses[i].toString('utf-8'))
        } else {
          query = false
          resultMessage = {
            success: query,
            message: 'Query response payloads is null',
            detail: errorMessage
          }
        }
        queryResults.push(resultMessage)
      }

      const result = {
        success: query,
        queryResults: queryResults
      }

      return result
    } catch (err) {
      l.error('Failed to query chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query chaincode: ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async invokeChaincode (peers, channelName, chaincodeName, fcn, args, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      const txId = client.newTransactionID()
      let invokeRequest = {
        targets: peers,
        chainId: channelName,
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args,
        txId: txId
      }
      let proposalResponseObject = await channel.sendTransactionProposal(invokeRequest)

      const proposalResponses = proposalResponseObject[0]
      const proposal = proposalResponseObject[1]

      let invoke = true
      let endorsement = true
      let ordering = true
      let invokeResult = {}
      let endorsementResults = []

      for (const i in proposalResponses) {
        let errorMessage
        let resultMessage

        if (proposalResponses[i] instanceof Error) {
          errorMessage = {
            code: proposalResponses[i].status,
            message: proposalResponses[i].message,
            targetPeer: proposalResponses[i].peer
          }
        } else if (proposalResponses[i] && proposalResponses[i].response.status === 200) {
          // l.info('instantiate proposal was good')
        } else {
          errorMessage = {
            message: 'invoke chaincode proposal was bad for an unknown reason : ' + proposalResponses[i],
            targetPeer: proposalResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: endorsement,
            message: 'Successfully sent Proposal and received ProposalResponse for invoke chaincode'
          }
        } else {
          invoke = false
          endorsement = false
          resultMessage = {
            success: endorsement,
            message: 'Failed to receive proper ProposalResponse for invoke chaincode',
            detail: errorMessage
          }
        }
        endorsementResults.push(resultMessage)
      }

      invokeResult.success = invoke
      invokeResult.endorsementResponse = {
        success: endorsement,
        message: endorsementResults
      }

      const orderingRequest = {
        txId: txId,
        proposalResponses: proposalResponses,
        proposal: proposal
      }

      const orderingResponse = await channel.sendTransaction(orderingRequest)
      let orderingResult

      if (orderingResponse.status === 'SUCCESS') {
        orderingResult = {
          success: ordering,
          message: 'Successfully sent transaction to the orderer'
        }
      } else {
        invoke = false
        ordering = false
        orderingResult = {
          success: ordering,
          code: orderingResponse.status,
          message: 'Failed to order the transaction'
        }
      }

      invokeResult.success = invoke
      invokeResult.orderingResponse = orderingResult

      let commitResult = await eventService.getTxEvent(channel, txId)

      if (commitResult.success === false) {
        invoke = false
      }
      invokeResult.success = invoke
      invokeResult.commitResponse = commitResult

      return invokeResult
    } catch (err) {
      l.error('Failed to invoke chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to invoke chaincode: ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryBlockByNumber (peer, channelName, blockNumber, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }
      let queryResult = await channel.queryBlock(parseInt(blockNumber, peer))
      // console.log('endorsement : ' + JSON.stringify(queryResult.data.data[0].payload.data.actions[0].payload.action.endorsements))
      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        blockData: queryResult
      }
      return result
    } catch (err) {
      l.error('Failed to query block by number : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query block by number : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryTransactionById (peer, channelName, txId, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      let queryResult = await channel.queryTransaction(txId, peer)
      // console.log('endorsement : ' + JSON.stringify(queryResult.transactionEnvelope.payload.data.actions[0].payload.action.endorsements))
      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        transactionData: queryResult
      }
      return result
    } catch (err) {
      l.error('Failed to query transaction by ID : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query transaction by ID : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryBlockByHash (peer, channelName, blockHash, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      let queryResult = await channel.queryBlockByHash(Buffer.from(blockHash, 'hex'), peer)

      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        blockData: queryResult
      }
      return result
    } catch (err) {
      l.error('Failed to query block by hash : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query block by hash : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryChainInfo (peer, channelName, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      let queryResult = await channel.queryInfo(peer)
      // let currentBlockHash = queryResult.currentBlockHash.buffer.toString('hex', queryResult.currentBlockHash.offset, queryResult.currentBlockHash.limit)
      // let previousBlockHash = queryResult.previousBlockHash.buffer.toString('hex', queryResult.previousBlockHash.offset, queryResult.previousBlockHash.limit)
      // console.log('currentBlockHash : ' + currentBlockHash)
      // console.log('previousBlockHash : ' + previousBlockHash)
      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        chainInfo: queryResult
      }
      return result
    } catch (err) {
      l.error('Failed to query chain info : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query chain info : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryInstalledChaincodes (peer, channelName, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      let queryResult = await client.queryInstalledChaincodes(peer, true)

      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        chaincodes: queryResult.chaincodes
      }
      return result
    } catch (err) {
      l.error('Failed to query installed chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query installed chaincode : ' + err.toString())
    }
  }
  async queryInstantiatedChaincodes (peer, channelName, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      channel = client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      let queryResult = await channel.queryInstantiatedChaincodes(peer, true)

      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        chaincodes: queryResult.chaincodes
      }
      return result
    } catch (err) {
      l.error('Failed to query instantiated chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query instantiated chaincode : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryChannels (peer, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      let message
      let success = true

      let queryResult = await client.queryChannels(peer)

      if (queryResult) {
        message = 'Successfully get query response'
      } else {
        success = false
        message = 'Query response payloads is null'
      }

      const result = {
        success: success,
        message: message,
        channels: queryResult.channels
      }
      return result
    } catch (err) {
      l.error('Failed to query channel list : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query channel list : ' + err.toString())
    }
  }
  async queryWithRolling (channelName, chaincodeName, fcn, args, client) {
    let channel = null
    try {
      let message

      channel = await client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }

      const channelPeers = channel._channel_peers
      const getRandomPeer = iterable => iterable.get([...iterable.keys()][Math.floor(Math.random() * iterable.size)])

      let targetPeerName = getRandomPeer(channelPeers)._name

      let queryRequest = {
        targets: targetPeerName,
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args
      }
      let queryResponses = await channel.queryByChaincode(queryRequest)
      let queryResults = []
      let query = true

      for (const i in queryResponses) {
        let errorMessage
        let resultMessage

        if (queryResponses[i] instanceof Error) {
          errorMessage = {
            code: queryResponses[i].status,
            message: queryResponses[i].message,
            targetPeer: queryResponses[i].peer
          }
        } else if (queryResponses[i]) {
          // l.info('instantiate proposal was good')
        } else {
          errorMessage = {
            message: 'query chaincode was bad for an unknown reason : ' + queryResponses[i],
            targetPeer: queryResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: query,
            message: 'Successfully get query response'
          }
          resultMessage.queryResponse = JSON.parse(queryResponses[i].toString('utf-8'))
        } else {
          query = false
          resultMessage = {
            success: query,
            message: 'Query response payloads is null',
            detail: errorMessage
          }
        }
        queryResults.push(resultMessage)
      }

      const result = {
        success: query,
        targetPeer: targetPeerName,
        queryResults: queryResults
      }

      return result
    } catch (err) {
      l.error('Failed to query chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query chaincode: ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryWithDiscovery (channelName, chaincodeName, fcn, args, client) {
    let channel = null

    try {
      let message
      channel = await client.getChannel(channelName)
      if (!channel) {
        message = channelName + ' was not defined in the connection profile'
        throw new Error(message)
      }
      await channel.initialize({ discover: true, asLocalhost: false })

      let unsortedPeers = []
      let sortedPeers = []
      let discoveryResults = channel._discovery_results

      if (discoveryResults) {
        for (const org in discoveryResults.peers_by_org) {
          for (const peer of discoveryResults.peers_by_org[org].peers) {
            unsortedPeers.push(peer)
          }
        }
        sortedPeers = unsortedPeers.sort((a, b) => {
          if (!a || !b) {
            return 0
          }
          if (a.ledger_height && !b.ledger_height) {
            return -1
          }
          if (!a.ledger_height && b.ledger_height) {
            return 1
          }

          if (a.ledger_height && a.ledger_height.compare) {
            const result = -1 * a.ledger_height.compare(b.ledger_height)
            return result
          }
          return 1
        })
      }

      // let targetPeer = sortedPeers[Math.floor(Math.random() * sortedPeers.length)]
      let targetPeerName = sortedPeers[0].name

      let queryRequest = {
        targets: targetPeerName,
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args,
        txId: client.newTransactionID()
      }
      let queryResponses = await channel.queryByChaincode(queryRequest)
      let queryResults = []
      let query = true

      for (const i in queryResponses) {
        let errorMessage
        let resultMessage

        if (queryResponses[i] instanceof Error) {
          errorMessage = {
            code: queryResponses[i].status,
            message: queryResponses[i].message,
            targetPeer: queryResponses[i].peer
          }
        } else if (queryResponses[i]) {
          // l.info('instantiate proposal was good')
        } else {
          errorMessage = {
            message: 'query chaincode was bad for an unknown reason : ' + queryResponses[i],
            targetPeer: queryResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: query,
            message: 'Successfully get query response'
          }
          resultMessage.queryResponse = JSON.parse(queryResponses[i].toString('utf-8'))
        } else {
          query = false
          resultMessage = {
            success: query,
            message: 'Query response payloads is null',
            detail: errorMessage
          }
        }
        queryResults.push(resultMessage)
      }

      const result = {
        success: query,
        targetPeer: targetPeerName,
        discoveryPeers: sortedPeers,
        queryResults: queryResults
      }

      return result
    } catch (err) {
      l.error('Failed to query chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query chaincode: ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async queryWithContract (channelName, chaincodeName, fcn, args, gateway) {
    try {
      const network = await gateway.getNetwork(channelName)
      const contract = network.getContract(chaincodeName)

      const result = await contract.evaluateTransaction(fcn, ...args)

      return result.toString('utf8')
    } catch (err) {
      console.log('Failed to query chaincode : ' + err.stack ? err.stack : err)
      l.error('Failed to query chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to query chaincode: ' + err.toString())
    }
  }
  async invokeWithContract (channelName, chaincodeName, fcn, args, gateway) {
    try {
      let success = false
      const network = await gateway.getNetwork(channelName)
      const contract = network.getContract(chaincodeName)

      await contract.submitTransaction(fcn, ...args)

      success = true
      let msg = 'Transaction has been submitted'

      await gateway.disconnect()

      return {
        success: success,
        msg: msg
      }
    } catch (err) {
      console.log('Failed to invoke chaincode : ' + err.stack ? err.stack : err)
      l.error('Failed to invoke chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to invoke chaincode: ' + err.toString())
    }
  }
}
export default new TransactionService()
