const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')
const crypto = require("crypto")

const clipboardManagerPort = 1625
const clipboardServerPort = 1626
const cliServerPort = 1627

const projectPath = path.join(os.homedir(), '.projectunity')
const userPath = path.join(projectPath, 'user.json')
const logPath = path.join(projectPath, 'logs')
const clipboardManagerPath = path.join(projectPath, 'ClipboardManager')

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

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file)
            file.on('finish', () => {
                file.close((err) => {
                    if (err)
                        reject(err)
                    else
                        resolve(url)
                })
            })
        }).on('error', (err) => {
            fs.unlink(dest)
            reject(err)
        })
    })
}

module.exports = {
    getOS,
    getUniqueId,
    terminate,
    ensurePath,
    download,
    clipboardServerPort,
    clipboardManagerPort,
    cliServerPort,
    projectPath,
    userPath,
    logPath,
    clipboardManagerPath
}