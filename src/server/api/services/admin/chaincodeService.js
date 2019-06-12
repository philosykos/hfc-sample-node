import fs from 'fs'
import path from 'path'
import walletService from '../common/walletService'
import l from '../../../common/logger'
import eventService from '../common/eventService'
import { Package } from 'fabric-client'

const rootPath = path.join(process.cwd())

class ChaincodeService {
  async installChaincode (peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)

      let installRequest = {
        targets: peers,
        chaincodePath: chaincodePath,
        chaincodeId: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        chaincodeType: chaincodeType
      }

      let installResults = await client.installChaincode(installRequest)
      const proposalResponses = installResults[0]
      // const proposal = installResults[1]

      let responseMessages = []
      let success = true

      for (const i in proposalResponses) {
        let errorMessage
        let resultMessage

        if (proposalResponses[i] instanceof Error && proposalResponses[i].isProposalResponse) {
          errorMessage = {
            code: proposalResponses[i].status,
            message: proposalResponses[i].message,
            targetPeer: proposalResponses[i].peer
          }
        } else if (proposalResponses[i] instanceof Error && proposalResponses[i].code === 2) {
          errorMessage = {
            code: proposalResponses[i].code,
            message: proposalResponses[i].details
          }
        } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
          // l.info('install proposal was good')
        } else {
          errorMessage = {
            message: 'install proposal was bad for an unknown reason : ' + proposalResponses[i],
            targetPeer: proposalResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: success,
            message: 'Successfully installed chaincode to peer'
          }
          // l.info(message)
        } else {
          success = false
          resultMessage = {
            success: success,
            message: 'Failed to install chaincode to peer',
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
      l.error('Failed to install chaincode: ' + err.stack ? err.stack : err)
      throw new Error('Failed to install chaincode: ' + err.toString())
    }
  }

  async createChaincodeDevelopmentSpec (name, ccpath, version, type) {
    try {
      const pkg = await Package.fromDirectory({
        name: name,
        version: version,
        path: ccpath,
        type: type
      })
      const packageBuffer = await pkg.toBuffer()
      const cdsName = name + '.cds'
      const cdsPath = path.join(rootPath, 'network/chaincode', name, cdsName)
      fs.writeFileSync(cdsPath, packageBuffer)

      return packageBuffer
    } catch (err) {
      l.error('Failed to create CDS : ' + err.stack ? err.stack : err)
      throw new Error('Failed to create CDS : ' + err.toString())
    }
  }

  async installChaincodePackage (peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, mspId, userName) {
    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      const packageBuffer = await this.createChaincodeDevelopmentSpec(chaincodeName, chaincodePath, chaincodeVersion, chaincodeType)
      // const packagePath = path.join(rootPath, '/network/test-network/chaincode/chaincode_example02/pack/')
      // const packageBuffer = fs.readFileSync(packagePath + 'chaincode_example02.cds')
      // const pkg3 = await Package.fromBuffer(packageBuffer)

      let installRequest = {
        targets: peers,
        chaincodePath: chaincodePath,
        chaincodeId: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        chaincodePackage: packageBuffer,
        chaincodeType: chaincodeType
      }

      let installResults = await client.installChaincode(installRequest)
      const proposalResponses = installResults[0]
      // const proposal = installResults[1]

      let responseMessages = []
      let success = true

      for (const i in proposalResponses) {
        let errorMessage
        let resultMessage

        if (proposalResponses[i] instanceof Error && proposalResponses[i].isProposalResponse) {
          errorMessage = {
            code: proposalResponses[i].status,
            message: proposalResponses[i].message,
            targetPeer: proposalResponses[i].peer
          }
        } else if (proposalResponses[i] instanceof Error && proposalResponses[i].code === 2) {
          errorMessage = {
            code: proposalResponses[i].code,
            message: proposalResponses[i].details
          }
        } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
          // l.info('install proposal was good')
        } else {
          errorMessage = {
            message: 'install proposal was bad for an unknown reason : ' + proposalResponses[i],
            targetPeer: proposalResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: success,
            message: 'Successfully installed chaincode to peer'
          }
          // l.info(message)
        } else {
          success = false
          resultMessage = {
            success: success,
            message: 'Failed to install chaincode to peer',
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
      l.error('Failed to install chaincode: ' + err.stack ? err.stack : err)
      throw new Error('Failed to install chaincode: ' + err.toString())
    }
  }

  async instantiateChaincode (peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      channel = client.getChannel(channelName)
      const txId = client.newTransactionID(true)
      const endorsementPolicy = {
        identities: [
          { role: { name: 'member', mspId: 'skcc' } },
          { role: { name: 'member', mspId: 'contractor1' } }
        ],
        policy: {
          '2-of': [ { 'signed-by': 0 }, { 'signed-by': 1 } ]
        }
      }

      let instantiateRequest = {
        targets: peers,
        chaincodeId: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        chaincodeType: chaincodeType,
        txId: txId,
        transientMap: '',
        fcn: fcn,
        args: args,
        'collections-config': '',
        'endorsement-policy': endorsementPolicy
      }

      let proposalResponseObject = await channel.sendInstantiateProposal(instantiateRequest, 120000)

      const proposalResponses = proposalResponseObject[0]
      const proposal = proposalResponseObject[1]

      let instantiate = true
      let endorsement = true
      let ordering = true
      let instantiateResult = {}
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
        } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
          // l.info('instantiate proposal was good')
        } else {
          errorMessage = {
            message: 'instantiate proposal was bad for an unknown reason : ' + proposalResponses[i],
            targetPeer: proposalResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: endorsement,
            message: 'Successfully sent Proposal and received ProposalResponse for chaincode instantiate'
          }
        } else {
          instantiate = false
          endorsement = false
          resultMessage = {
            success: endorsement,
            message: 'Failed to receive proper ProposalResponse for chaincode instantiate',
            detail: errorMessage
          }
        }
        endorsementResults.push(resultMessage)
      }

      instantiateResult.success = instantiate
      instantiateResult.endorsementResponse = {
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
        instantiate = false
        ordering = false
        orderingResult = {
          success: ordering,
          code: orderingResponse.status,
          message: 'Failed to order the transaction'
        }
      }

      instantiateResult.success = instantiate
      instantiateResult.orderingResponse = orderingResult

      let commitResult = await eventService.getTxEvent(channel, txId)

      if (commitResult.success === false) {
        instantiate = false
      }
      instantiateResult.success = instantiate
      instantiateResult.commitResponse = commitResult

      return instantiateResult
    } catch (err) {
      l.error('Failed to instantiate chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to instantiate chaincode : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
  async upgradeChaincode (peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, mspId, userName) {
    let channel = null

    try {
      const client = await walletService.getClientFromWallet(mspId, userName)
      channel = client.getChannel(channelName)
      const txId = client.newTransactionID(true)
      const endorsementPolicy = {
        identities: [
          { role: { name: 'member', mspId: 'skcc' } },
          { role: { name: 'member', mspId: 'contractor1' } }
        ],
        policy: {
          '2-of': [ { 'signed-by': 0 }, { 'signed-by': 1 } ]
        }
      }

      let upgradeRequest = {
        targets: peers,
        chaincodeId: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        chaincodeType: chaincodeType,
        txId: txId,
        transientMap: '',
        fcn: fcn,
        args: args,
        'collections-config': '',
        'endorsement-policy': endorsementPolicy
      }

      let proposalResponseObject = await channel.sendUpgradeProposal(upgradeRequest, 120000)

      const proposalResponses = proposalResponseObject[0]
      const proposal = proposalResponseObject[1]

      let upgrade = true
      let endorsement = true
      let ordering = true
      let upgradeResult = {}
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
        } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
          // l.info('upgrade proposal was good')
        } else {
          errorMessage = {
            message: 'upgrade proposal was bad for an unknown reason : ' + proposalResponses[i],
            targetPeer: proposalResponses[i].peer
          }
        }

        if (!errorMessage) {
          resultMessage = {
            success: endorsement,
            message: 'Successfully sent Proposal and received ProposalResponse for chaincode upgrade'
          }
        } else {
          upgrade = false
          endorsement = false
          resultMessage = {
            success: endorsement,
            message: 'Failed to receive proper ProposalResponse for chaincode upgrade',
            detail: errorMessage
          }
        }
        endorsementResults.push(resultMessage)
      }

      upgradeResult.success = upgrade
      upgradeResult.endorsementResponse = {
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
        upgrade = false
        ordering = false
        orderingResult = {
          success: ordering,
          code: orderingResponse.status,
          message: 'Failed to order the transaction'
        }
      }

      upgradeResult.success = upgrade
      upgradeResult.orderingResponse = orderingResult

      let commitResult = await eventService.getTxEvent(channel, txId)

      if (commitResult.success === false) {
        upgrade = false
      }
      upgradeResult.success = upgrade
      upgradeResult.commitResponse = commitResult

      return upgradeResult
    } catch (err) {
      l.error('Failed to upgrade chaincode : ' + err.stack ? err.stack : err)
      throw new Error('Failed to upgrade chaincode : ' + err.toString())
    } finally {
      if (channel) {
        channel.close()
      }
    }
  }
}

export default new ChaincodeService()
