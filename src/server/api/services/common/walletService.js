import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { FileSystemWallet, X509WalletMixin, Gateway } from 'fabric-network'

const rootPath = path.join(process.cwd())

class WalletService {
  async createWallet (mspId, userName) {
    try {
      const identityLabel = userName + '@' + mspId
      const credentialPath = path.join(rootPath, 'network', process.env.NETWORK_PATH, 'crypto-config/peerOrganizations/', mspId, '/users/', identityLabel)
      const cert = readAllFiles(path.join(credentialPath, '/msp/signcerts/'))[0].toString()
      const key = readAllFiles(path.join(credentialPath, '/msp/keystore/'))[0].toString()
      const identity = X509WalletMixin.createIdentity(mspId, cert, key)

      const wallet = new FileSystemWallet(path.join(rootPath, '/wallet'))
      await wallet.import(identityLabel, identity)
    } catch (err) {
      throw new Error('Failed to create wallet : ' + err)
    }
  }
  async getClientFromWallet (mspId, userName) {
    try {
      const identityLabel = userName + '@' + mspId

      const wallet = new FileSystemWallet(path.join(rootPath, '/wallet'))

      const gateway = new Gateway()

      let connectionProfile = yaml.safeLoad(fs.readFileSync(path.join(rootPath, 'network', process.env.NETWORK_PATH, 'network-connection.yaml'), 'utf8'))
      let connectionOptions = {
        identity: identityLabel,
        wallet: wallet,
        discovery: { enabled: true, asLocalhost: false }
      }

      await gateway.connect(connectionProfile, connectionOptions)
      const client = await gateway.getClient()

      return client
    } catch (err) {
      console.log(err)
      throw new Error('Failed get client from wallet : ' + err)
    }
  }
  async getGatewayFromWallet (mspId, userName) {
    try {
      const identityLabel = userName + '@' + mspId

      const wallet = new FileSystemWallet(path.join(rootPath, '/wallet'))

      const gateway = new Gateway()

      let connectionProfile = yaml.safeLoad(fs.readFileSync(path.join(rootPath, 'network', process.env.NETWORK_PATH, 'network-connection.yaml'), 'utf8'))
      let connectionOptions = {
        identity: identityLabel,
        wallet: wallet,
        discovery: { enabled: true, asLocalhost: false }
      }

      await gateway.connect(connectionProfile, connectionOptions)

      return gateway
    } catch (err) {
      console.log(err)
      throw new Error('Failed get gateway from wallet : ' + err)
    }
  }
}

export default new WalletService()

function readAllFiles (dir) {
  let files = fs.readdirSync(dir)
  let certs = []
  files.forEach((fileName) => {
    let filePath = path.join(dir, fileName)
    let data = fs.readFileSync(filePath)
    certs.push(data)
  })
  return certs
}
