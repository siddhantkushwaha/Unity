const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require("crypto")

const clipboardManagerPort = 1625
const clipboardServerPort = 1626
const cliServerPort = 1627

const projectPath = path.join(os.homedir(), '.projectunity')
const userPath = path.join(projectPath, 'user.json')
const logPath = path.join(projectPath, 'logs')

const terminate = (code) => {
    process.exit(code)
}

const getUniqueId = () => {
    return crypto.randomBytes(20).toString('hex')
}

const getOS = () => {
    switch (os.type()) {
        case "Darwin":
            return 'MacOS'
        case "Linux":
            return "Linux"
        case "Windows_NT":
            return "Windows"
    }
}

const ensurePath = (path) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            fs.mkdir(path, { 'recursive': true }, error => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(path)
                }
            })
        }
        else {
            resolve(path)
        }
    })
}

module.exports = {
    getOS,
    getUniqueId,
    terminate,
    clipboardServerPort,
    clipboardManagerPort,
    cliServerPort,
    projectPath,
    userPath,
    logPath,
    ensurePath
}