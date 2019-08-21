const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")

const cpoData = require("./cpo-data.json")


module.exports = class CpoBackend {

    TOKEN_B
    TOKEN_C

    cpoInfo
    clientEndpoints
    app

    constructor(cpoInfo) {
        this.cpoInfo = cpoInfo
        this.TOKEN_B = "f3f1985e-8341-490d-ab06-17584175998c"
        try {
            TOKEN_C = fs.readFileSync(`./${cpoInfo.countryCode}-${cpoInfo.partyID}-TOKEN_C`).toString()
        } catch (e) {

        }
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
        this.TOKEN_C = token
        fs.writeFileSync(`./${this.cpoInfo.countryCode}-${this.cpoInfo.partyID}-TOKEN_C`, token)
    }

    changeOwner(data) {
        const ownerData = { country_code: this.cpoInfo.countryCode, party_id: this.cpoInfo.partyID }
        return Object.assign(data, ownerData)
    }

    initAppRoutes() {
        this.app.get("/ocpi/versions", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
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
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/2.2", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                res.send({
                    status_code: 1000,
                    data: {
                        "version": "2.2",
                        "endpoints": [
                            {
                                "identifier": "locations",
                                "role": "SENDER",
                                "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/locations`
                            },
                            {
                                "identifier": "tariffs",
                                "role": "SENDER",
                                "url": `http://localhost:${this.cpoInfo.backendPort}/ocpi/cpo/2.2/tariffs`
                            }
                        ]
                    },
                    timestamp: new Date()
                })
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/cpo/2.2/locations", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                res.send({
                    status_code: 1000,
                    data: cpoData.locations.map(loc => this.changeOwner(loc)),
                    timestamp: new Date()
                })
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/cpo/2.2/locations/:id", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                const location = cpoData.locations.find(loc => loc.id === req.params.id)
                if (location) {
                    res.send({
                        status_code: 1000,
                        data: this.changeOwner(location),
                        timestamp: new Date()
                    })
                } else {
                    res.send({
                        status_code: 2003,
                        status_message: "Location not found",
                        timestamp: new Date()
                    })
                }
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/cpo/2.2/locations/:id/:evse", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                const location = cpoData.locations.find(loc => loc.id === req.params.id)
                if (location) {
                    const evse = location.evses.find(evse => evse.uid === req.params.evse)
                    if (evse) {
                        res.send({
                            status_code: 1000,
                            data: evse,
                            timestamp: new Date()
                        })
                    } else {
                        res.send({
                            status_code: 2003,
                            status_message: "EVSE not found",
                            timestamp: new Date()
                        })
                    }
                } else {
                    res.send({
                        status_code: 2003,
                        status_message: "Location not found",
                        timestamp: new Date()
                    })
                }
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/cpo/2.2/locations/:id/:evse/:connector", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                const location = cpoData.locations.find(loc => loc.id === req.params.id)
                if (location) {
                    const evse = location.evses.find(evse => evse.uid === req.params.evse)
                    if (evse) {
                        const connector = evse.connectors.find(connector => connector.id === req.params.connector)
                        if (connector) {
                            res.send({
                                status_code: 1000,
                                data: connector,
                                timestamp: new Date()
                            })
                        } else {
                            res.send({
                                status_code: 2003,
                                status_message: "Connector not found",
                                timestamp: new Date()
                            })
                        }
                    } else {
                        res.send({
                            status_code: 2003,
                            status_message: "EVSE not found",
                            timestamp: new Date()
                        })
                    }
                } else {
                    res.send({
                        status_code: 2003,
                        status_message: "Location not found",
                        timestamp: new Date()
                    })
                }
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

        this.app.get("/ocpi/cpo/2.2/tariffs", async (req, res) => {
            if (req.headers["authorization"] === `Token ${this.TOKEN_B}`) {
                res.send({
                    status_code: 1000,
                    data: cpoData.tariffs.map(tariff => this.changeOwner(tariff)),
                    timestamp: new Date()
                })
            } else {
                res.send({
                    status_code: 2001,
                    timestamp: new Date()
                })
            }
        })

    }

}
