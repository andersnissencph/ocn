const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const uuid = require("uuid")

const cpoData = require("./data.json")

const COUNTRY_CODE = "DE"
const PARTY_ID = "CPO"

let clientEndpoints

let TOKEN_B = "f3f1985e-8341-490d-ab06-17584175998c"
let TOKEN_C

try {
    TOKEN_C = fs.readFileSync("./tokenC").toString()
} catch (e) {

}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan(`CPO [${COUNTRY_CODE} ${PARTY_ID}] -- :method :url :status :res[content-length] - :response-time ms`))

app.get("/ocpi/versions", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
        res.send({
            status_code: 1000,
            data: cpoData.versions,
            timestamp: new Date()
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.get("/ocpi/2.2", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
        res.send({
            status_code: 1000,
            data: cpoData.version_detail,
            timestamp: new Date()
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.get("/ocpi/cpo/2.2/locations", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
        res.send({
            status_code: 1000,
            data: cpoData.locations,
            timestamp: new Date()
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.get("/ocpi/cpo/2.2/locations/:id", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
        const location = cpoData.locations.find(loc => loc.id === req.params.id)
        if (location) {
            res.send({
                status_code: 1000,
                data: location,
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

app.get("/ocpi/cpo/2.2/locations/:id/:evse", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
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

app.get("/ocpi/cpo/2.2/locations/:id/:evse/:connector", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
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

app.get("/ocpi/cpo/2.2/tariffs", async (req, res) => {
    if (req.headers["authorization"] === `Token ${TOKEN_B}`) {
        res.send({
            status_code: 1000,
            data: cpoData.tariffs,
            timestamp: new Date()
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

module.exports = {
    COUNTRY_CODE,
    PARTY_ID,
    TOKEN_B,
    setClientEndpoints: (endpoints) => clientEndpoints = endpoints,
    setTokenC: (token) => {
        TOKEN_C = token
        fs.writeFileSync("./tokenC", token)
    },
    start: async () => new Promise((resolve, _) => app.listen("3000", resolve))
}
