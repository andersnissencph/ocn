const ethers = require('ethers')
const utils = require('web3-utils')

module.exports = {
    sign: async (countryCode, partyID, brokerURL, wallet) => {
        const txMsg = utils.soliditySha3(countryCode, partyID, brokerURL)
        const messageHashBytes = ethers.utils.arrayify(txMsg)
        const flatSig = await wallet.signMessage(messageHashBytes)
        const sig = ethers.utils.splitSignature(flatSig)
        return [
            countryCode,
            partyID,
            brokerURL,
            sig.v,
            sig.r,
            sig.s
        ]
    }
}