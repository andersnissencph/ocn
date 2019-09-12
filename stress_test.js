const fetch = require("node-fetch")

const CpoBackend = require("./src/cpo-backend")

const cpo = new CpoBackend({
    partyID: "CPO",
    countryCode: "DE",
    backendPort: "3000",
    client: "http://localhost:8080"
})

/**
 * Register CPO to OCN Client (if not already)
 */
async function main() {

    await cpo.start()

    const regCheckRes = await fetch(`http://localhost:8080/admin/connection-status/DE/CPO`, {
        headers: {
            "Authorization": "Token randomkey"
        }
    })
    
    const regCheckText = await regCheckRes.text()
    
    if (regCheckRes.status !== 200 || regCheckText !== "CONNECTED") {
    
    
        /**
         * Request TOKEN_A via OCN Client admin panel 
         */
    
        const adminRes = await fetch(`http://localhost:8080/admin/generate-registration-token`, {
            method: "POST",
            headers: {
                "Authorization": "Token randomkey",
                "Content-Type": "application/json"
            },
            body: JSON.stringify([{country_code: "DE", party_id: "CPO"}])
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
        cpo.clientEndpoints = versionDetailBody.data.endpoints
    
        /**
         * Register to OCN Client using OCPI credentials module
         */
    
        const regRes = await fetch(`http://localhost:8080/ocpi/2.2/credentials`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${adminBody.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: CpoBackend.TOKEN_B,
                url: `http://localhost:3000/ocpi/versions`,
                roles: [{
                    party_id: "CPO",
                    country_code: "DE",
                    role: "CPO",
                    business_details: {
                        name: "Stress Test CPO"
                    }
                }]
            })
        })
    
        const regBody = await regRes.json()
        cpo.saveTokenC(regBody.data.token)
    
        console.log(`CPO [DE CPO] completed OCPI connection with OCN client at http://localhost:8080`)
    } else {
        console.log(`CPO [DE CPO] has already connected to OCN client at http://localhost:8080. Skipping...`)
    }
}

main()