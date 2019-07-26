const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const uuid = require("uuid")

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan(`EMSP [DE MSP] -- :method :url :status :res[content-length] - :response-time ms`))

app.get("/ocpi/versions", async (req, res) => {
    res.send({
        status_code: 1000,
        data: {
            versions: [{
                version: "2.2",
                url: "http://localhost:3001/ocpi/2.2"
            }]
        },
        timestamp: new Date()
    })
})

app.get("/ocpi/2.2", async (req, res) => {
    res.send({
        status_code: 1000,
        data: {
            version: "2.2",
            endpoints: []
        },
        timestamp: new Date()
    })
})

module.exports = {
    start: async () => new Promise((resolve, _) => app.listen("3001", resolve))
}
