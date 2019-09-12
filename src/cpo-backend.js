const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const fetch = require("node-fetch")

const cpoData = require("./cpo-data.json")


module.exports = class CpoBackend {

    static get TOKEN_B() {
        return "f3f1985e-8341-490d-ab06-17584175998c"
    }

    constructor(cpoInfo) {
        this.cpoInfo = cpoInfo
        this.app = express()
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(morgan(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] -- :method :url :status :res[content-length] - :response-time ms`))
        this.initAppRoutes()
    }

    async start() {
        return new Promise((resolve, _) => {
            this.app.listen(this.cpoInfo.backendPort, () => {
                console.log(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] listening on ${this.cpoInfo.backendPort}`)
                resolve()
            })
        })
    }

    saveTokenC(token) {
        fs.writeFileSync(`./${this.cpoInfo.countryCode}-${this.cpoInfo.partyID}-TOKEN_C`, token)
    }

    readTokenC() {
        return fs.readFileSync(`./${this.cpoInfo.countryCode}-${this.cpoInfo.partyID}-TOKEN_C`)
    }

    changeOwner(data) {
        const ownerData = { country_code: this.cpoInfo.countryCode, party_id: this.cpoInfo.partyID }
        return Object.assign(data, ownerData)
    }

    authorize(req, res, next) {
        if (req.headers["authorization"] !== `Token ${CpoBackend.TOKEN_B}`) {
            return res.send({
                status_code: 2001,
                timestamp: new Date()
            })
        }
        next()
    }

    initAppRoutes() {
        this.app.get("/ocpi/versions", this.authorize, async (req, res) => {
            res.send({
                status_code: 1000,
                data: {
                    "versions": [{
                        "version": "2.2",
                        "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/2.2`
                    }]
                },
                timestamp: new Date()
            })
        })

        this.app.get("/ocpi/2.2", this.authorize, async (req, res) => {
            res.send({
                status_code: 1000,
                data: {
                    "version": "2.2",
                    "endpoints": [
                        // {
                        //     "identifier": "locations",
                        //     "role": "SENDER",
                        //     "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/locations`
                        // },
                        // {
                        //     "identifier": "tariffs",
                        //     "role": "SENDER",
                        //     "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/tariffs`
                        // },
                        {
                            "identifier": "commands",
                            "role": "RECEIVER",
                            "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/commands`
                        }
                    ]
                },
                timestamp: new Date()
            })
        })

        // this.app.get("/ocpi/cpo/2.2/locations", this.authorize, async (req, res) => {
        //     res.links({
        //         next: `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/locations`
        //     }).set({
        //         "X-Limit": "1",
        //         "X-Total-Count": "1",
        //     }).send({
        //         status_code: 1000,
        //         data: cpoData.locations.map(loc => this.changeOwner(loc)),
        //         timestamp: new Date()
        //     })
        // })

        // this.app.get("/ocpi/cpo/2.2/locations/:id", this.authorize, async (req, res) => {
        //     const location = cpoData.locations.find(loc => loc.id === req.params.id)
        //     if (location) {
        //         res.send({
        //             status_code: 1000,
        //             data: this.changeOwner(location),
        //             timestamp: new Date()
        //         })
        //     } else {
        //         res.send({
        //             status_code: 2003,
        //             status_message: "Location not found",
        //             timestamp: new Date()
        //         })
        //     }
        // })

        // this.app.get("/ocpi/cpo/2.2/locations/:id/:evse", this.authorize, async (req, res) => {
        //     const location = cpoData.locations.find(loc => loc.id === req.params.id)
        //     if (location) {
        //         const evse = location.evses.find(evse => evse.uid === req.params.evse)
        //         if (evse) {
        //             res.send({
        //                 status_code: 1000,
        //                 data: evse,
        //                 timestamp: new Date()
        //             })
        //         } else {
        //             res.send({
        //                 status_code: 2003,
        //                 status_message: "EVSE not found",
        //                 timestamp: new Date()
        //             })
        //         }
        //     } else {
        //         res.send({
        //             status_code: 2003,
        //             status_message: "Location not found",
        //             timestamp: new Date()
        //         })
        //     }
        // })

        // this.app.get("/ocpi/cpo/2.2/locations/:id/:evse/:connector", this.authorize, async (req, res) => {
        //     const location = cpoData.locations.find(loc => loc.id === req.params.id)
        //     if (location) {
        //         const evse = location.evses.find(evse => evse.uid === req.params.evse)
        //         if (evse) {
        //             const connector = evse.connectors.find(connector => connector.id === req.params.connector)
        //             if (connector) {
        //                 res.send({
        //                     status_code: 1000,
        //                     data: connector,
        //                     timestamp: new Date()
        //                 })
        //             } else {
        //                 res.send({
        //                     status_code: 2003,
        //                     status_message: "Connector not found",
        //                     timestamp: new Date()
        //                 })
        //             }
        //         } else {
        //             res.send({
        //                 status_code: 2003,
        //                 status_message: "EVSE not found",
        //                 timestamp: new Date()
        //             })
        //         }
        //     } else {
        //         res.send({
        //             status_code: 2003,
        //             status_message: "Location not found",
        //             timestamp: new Date()
        //         })
        //     }
        // })

        // this.app.get("/ocpi/cpo/2.2/tariffs", this.authorize, async (req, res) => {
        //     res.send({
        //         status_code: 1000,
        //         data: cpoData.tariffs.map(tariff => this.changeOwner(tariff)),
        //         timestamp: new Date()
        //     })
        // })

        this.app.post("/ocpi/cpo/2.2/commands/:command", this.authorize, async (req, res) => {
            // setTimeout(async () => {
            //     const headers = {
            //         "Content-Type": "application/json",
            //         "Authorization": `Token ${this.readTokenC()}`,
            //         "X-Request-ID": "123",
            //         "X-Correlation-ID": "123",
            //         "OCPI-from-country-code": this.cpoInfo.countryCode,
            //         "OCPI-from-party-id": this.cpoInfo.partyID,
            //         "OCPI-to-country-code": req.headers["ocpi-from-country-code"],
            //         "OCPI-to-party-id": req.headers["ocpi-from-party-id"]
            //     }

            //     console.log(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] sending async ${req.params.command} response`)
            //     const asyncResponseResult = await fetch(req.body.response_url, {
            //         method: "POST",
            //         headers,
            //         body: JSON.stringify({ result: "ACCEPTED" })
            //     })

                // if (req.params.command === "STOP_SESSION") {
                //     console.log(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] sending cdr after session end`)                    
                //     setTimeout(async () => {
                //         const postCdrResult = await fetch(`${this.cpoInfo.client}/ocpi/receiver/2.2/cdrs`, {
                //             method: "POST",
                //             headers,
                //             body: JSON.stringify(this.changeOwner(cpoData.cdrs))
                //         })
                //         const getCdrResult = await fetch(postCdrResult.headers.get("location"), { headers })
                //         const storedCdr = await getCdrResult.json()
                //         if (storedCdr.status_code === 1000 && storedCdr.data.id === cpoData.cdrs.id) {
                //             console.log(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] acknowledges cdr correctly stored on EMSP system`)
                //         } else {
                //             console.log(`CPO [${this.cpoInfo.countryCode} ${this.cpoInfo.partyID}] could not verify cdr correctly stored on EMSP system`)
                //         }
                //     }, 5 * 1000)
                // }

            // }, 5 * 1000)
            res.send({
                status_code: 1000,
                data: {
                    result: "ACCEPTED",
                    timeout: 20
                },
                timestamp: new Date()
            })
        })

    }

}
