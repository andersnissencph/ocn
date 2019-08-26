const fetch = require("node-fetch")
const ethers = require("ethers")
const CpoBackend = require("./cpo-backend")
const mspBackend = require("./msp-backend")
const signer = require("./lib/signer")
const utils = require("./lib/utils")

const cpoInfo = [
    {
        partyID: "CPO",
        countryCode: "DE",
        backendPort: "3100",
        client: "http://localhost:8080"
    },
    {
        partyID: "CPX",
        countryCode: "NL",
        backendPort: "3101",
        client: "http://localhost:8081"
    }
]


async function main() {

    // setup wallet to send a transaction  (it doesn't need to be the same as the CPO which signs the data)
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8544")
    let wallet = ethers.Wallet.fromMnemonic("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat")
    wallet = wallet.connect(provider)

    // load the OCN Registry contract using its address and ABI
    const contract = new ethers.Contract("0x345cA3e014Aaf5dcA488057592ee47305D9B3e10", require("./registry.json"), wallet)


    /**
     * Setup each of the CPOs
     */

    for (cpo of cpoInfo) {

        /**
         * Start the specific CPO backend
         */
        const cpoBackend = new CpoBackend(cpo)
        await cpoBackend.start()

        /**
         * Register to OCN Registry (if not already)
         */

        // check registered status first
        const clientURL = await contract.clientURLOf(utils.toHex(cpo.countryCode), utils.toHex(cpo.partyID))

        if (clientURL === "") {

            /**
             * Register to OCN Registry
             */

            // Get OCN client info
            const clientInfoRes = await fetch(`${cpo.client}/ocn/registry/client-info`)
            const clientInfoBody = await clientInfoRes.json()

            // sign the transaction data with the CPO's wallet (in this case randomly created)
            const data = await signer.sign(utils.toHex(cpo.countryCode), utils.toHex(cpo.partyID), clientInfoBody.url, clientInfoBody.address, ethers.Wallet.createRandom())
            const tx = await contract.register(...data)

            await tx.wait()

            console.log(`CPO [${cpo.countryCode} ${cpo.partyID}] written into OCN Registry with OCN client ${cpo.client}`)
        } else {
            console.log(`CPO [${cpo.countryCode} ${cpo.partyID}] has already registered to OCN Registry. Skipping...`)
        }

        /**
         * Register CPO to OCN Client (if not already)
         */

        const regCheckRes = await fetch(`${cpo.client}/admin/connection-status/${cpo.countryCode}/${cpo.partyID}`, {
            headers: {
                "Authorization": "Token randomkey"
            }
        })

        const regCheckText = await regCheckRes.text()

        if (regCheckRes.status !== 200 || regCheckText !== "CONNECTED") {


            /**
             * Request TOKEN_A via OCN Client admin panel 
             */

            const adminRes = await fetch(`${cpo.client}/admin/generate-registration-token`, {
                method: "POST",
                headers: {
                    "Authorization": "Token randomkey",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{country_code: cpo.countryCode, party_id: cpo.partyID}])
            })

            const adminBody = await adminRes.json()

            /**
             * Get list of OCPI versions supported by OCN Client
             */

            const versionRes = await fetch(adminBody.versions, {
                headers: {
                    "Authorization": `Token ${adminBody.token}`
                }
            })

            const versionBody = await versionRes.json()

            /**
             * Get and store v2.2 endpoints of OCPI module interfaces supported by OCN Client
             */

            const versionDetailRes = await fetch(versionBody.data.versions.find(v => v.version === "2.2").url, {
                headers: {
                    "Authorization": `Token ${adminBody.token}`
                }
            })

            const versionDetailBody = await versionDetailRes.json()
            cpoBackend.clientEndpoints = versionDetailBody.data.endpoints

            /**
             * Register to OCN Client using OCPI credentials module
             */

            const regRes = await fetch(`${cpo.client}/ocpi/2.2/credentials`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${adminBody.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: CpoBackend.TOKEN_B,
                    url: `http://localhost:${cpo.backendPort}/ocpi/versions`,
                    roles: [{
                        party_id: cpo.partyID,
                        country_code: cpo.countryCode,
                        role: "CPO",
                        business_details: {
                            name: "Test CPO"
                        }
                    }]
                })
            })

            const regBody = await regRes.json()
            cpoBackend.saveTokenC(regBody.data.token)

            console.log(`CPO [${cpo.countryCode} ${cpo.partyID}] completed OCPI connection with OCN client at ${cpo.client}`)
        } else {
            console.log(`CPO [${cpo.countryCode} ${cpo.partyID}] has already connected to OCN client at ${cpo.client}. Skipping...`)
        }

    }

    /**
     * Run the EMSP backend which will provide the version endpoints for the OCN Client during the credentials handshake/registration
     */

    await mspBackend.start()
    console.log("MSP [DE MSP] listening on 3002")

    /**
     * Check MSP connection/registration status
     */
    const clientURLOfMSP = await contract.clientURLOf(utils.toHex("DE"), utils.toHex("MSP"))

    const mspRegCheck = await fetch("http://localhost:8080/admin/connection-status/DE/MSP", {
        headers: {
            "Authorization": "Token randomkey"
        }
    })

    const mspRegCheckText = await mspRegCheck.text()

    console.log(`MSP [DE MSP] connection status: [${clientURLOfMSP !== "" ? "x" : " "}] OCN Registry [${mspRegCheckText === "CONNECTED" ? "x" : " "}] OCN Client`)

}

main()
