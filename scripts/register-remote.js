const fetch = require("node-fetch")
const ethers = require("ethers")
const signer = require("../src/lib/signer")
const utils = require("../src/lib/utils")

fetch("http://52.59.229.171:8080/ocn/registry/client-info").then(async clientInfoRes => {

    const clientInfoBody = await clientInfoRes.json()

    // this wallet will send the transaction (it doesn't need to be the same as the CPO which signs the data)
    const provider = new ethers.providers.JsonRpcProvider("http://18.184.14.37:8545")
    let wallet = new ethers.Wallet("0x8d6af24598bfdec5b789ad10106740b480aa0f2b216290a68bf3bb2021be2989")
    wallet = wallet.connect(provider)
    
    // load the OCN Registry contract using its address and ABI
    const contract = new ethers.Contract("0xbF6cfceABdb46bb94b11E70de053a9da741912D5", require("../src/registry.json"), wallet)
    
    const mpsWallet = ethers.Wallet.createRandom()

    // sign the transaction data with the CPO's wallet (in this case randomly created)
    const data = await signer.sign(utils.toHex("DE"), utils.toHex("CPO"), clientInfoBody.url, clientInfoBody.address, mpsWallet)
    const tx = await contract.register(...data)
    
    await tx.wait()
    
    console.log("EMSP [DE MSP] has registered to the OCN on client http://localhost:8080 using wallet with address", mpsWallet.address)

})

// 1e80c10e-2c8c-4594-b358-feb85985bcfe
// 36cb2a1b-2c98-4bf7-8fab-4b6af5eed322