const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan("dev"))

app.get("/ocpi/cpo/versions", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: {
                versions: [{
                    version: "2.2",
                    url: "http://localhost:3000/ocpi/cpo/2.2"
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

app.get("/ocpi/cpo/2.2", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: {
                version: "2.2",
                endpoints: [{
                    identifier: "credentials",
                    role: "SENDER",
                    url: "http://max.charge.com/ocpi/cpo/2.2/credentials"
                }, {
                    identifier: "commands",
                    role: "SENDER",
                    url: "http://max.charge.com/ocpi/emsp/2.2/commands"
                }, {
                    identifier: "locations",
                    role: "SENDER",
                    url: "http://localhost:3000/ocpi/cpo/2.2/locations"
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

app.get("/ocpi/cpo/2.2/locations", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: [{
                country_code: "NL",
                party_id: "MAX",
                id: "LOC1",
                type: "ON_STREET",
                address: "somestreet 1",
                city: "Essen",
                country: "DEU",
                coordinates: {
                    latitude: "52.232",
                    longitude: "0.809"
                },
                evses: [{
                    uid: "1234",
                    status: "AVAILABLE",
                    connectors: [{
                        id: "1",
                        standard: "IEC_62196_T2",
                        format: "SOCKET",
                        power_type: "AC_3_PHASE",
                        max_voltage: 400,
                        max_amperage: 32,
                        last_updated: new Date()
                    }],
                    last_updated: new Date()
                }],
                last_updated: new Date()
            }],
            timestamp: new Date()
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.get("/ocpi/cpo/2.2/locations/LOC1", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: {
                country_code: "NL",
                party_id: "MAX",
                id: "LOC1",
                type: "ON_STREET",
                address: "somestreet 1",
                city: "Essen",
                country: "DEU",
                coordinates: {
                    latitude: "52.232",
                    longitude: "0.809"
                },
                evses: [{
                    uid: "1234",
                    status: "AVAILABLE",
                    connectors: [{
                        id: "1",
                        standard: "IEC_62196_T2",
                        format: "SOCKET",
                        power_type: "AC_3_PHASE",
                        max_voltage: 400,
                        max_amperage: 32,
                        last_updated: new Date()
                    }],
                    last_updated: new Date()
                }],
                last_updated: new Date()
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

app.get("/ocpi/cpo/2.2/locations/LOC1/1234", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: {
                uid: "1234",
                status: "AVAILABLE",
                connectors: [{
                    id: "1",
                    standard: "IEC_62196_T2",
                    format: "SOCKET",
                    power_type: "AC_3_PHASE",
                    max_voltage: 400,
                    max_amperage: 32,
                    last_updated: new Date()
                }],
                last_updated: new Date()
            }
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.get("/ocpi/cpo/2.2/locations/LOC1/1234/1", async (req, res) => {
    if (req.headers["authorization"] === "Token abc-123") {
        res.send({
            status_code: 1000,
            data: {
                id: "1",
                standard: "IEC_62196_T2",
                format: "SOCKET",
                power_type: "AC_3_PHASE",
                max_voltage: 400,
                max_amperage: 32,
                last_updated: new Date()
            }
        })
    } else {
        res.send({
            status_code: 2001,
            timestamp: new Date()
        })
    }
})

app.listen("3000", () => console.log("listening on 3000"))
