const fs = require('fs')
const path = require('path')
const extract = require('extract-zip')

const {getOS, projectPath, clipboardManagerPath} = require('./util')
const {download} = require('./util')

const getClipboardManagerBinaries = () => {
    return new Promise((resolve, reject) => {

        let url = ''
        switch (getOS()) {
            case 'Windows':
                url = ''
                break
            case 'MacOS':
                url = ''
                break
            default:
                break
        }

        const zipPath = path.join(projectPath, 'ClipboardManager.zip')
        download(url, zipPath)
            .then(url => {
                fs.rmdirSync(clipboardManagerPath, {recursive: true})
                extract(zipPath, {dir: clipboardManagerPath})
                    .then(() => {
                        fs.unlinkSync(zipPath)
                        resolve(url)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = {getClipboardManagerBinaries}