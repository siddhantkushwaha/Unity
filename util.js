const crypto = require("crypto")

const clipboardManagerPort = 1625
const clipboardServerPort = 1626
const cliServerPort = 1627

const terminate = (code) => {
    process.exit(code)
}

const getUniqueId = () => {
    return crypto.randomBytes(20).toString('hex')
}

module.exports = { getUniqueId, clipboardServerPort, clipboardManagerPort, cliServerPort, terminate }