const os = require('os')
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

const getOS = () => {
    switch(os.type()) {
        case "Darwin":
            return 'MacOS'
        case "Linux":
            return "Linux"
        case "Windows_NT":
            return "Windows"
    }
}

module.exports = { getOS, getUniqueId, clipboardServerPort, clipboardManagerPort, cliServerPort, terminate }