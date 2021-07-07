const fs = require('fs')
const path = require('path')
const extract = require('extract-zip')

const { getOS, projectPath, clipboardManagerPath } = require('./util')
const { download } = require('./util')

const getClipboardManagerBinaries = () => {
    return new Promise((resolve, reject) => {

        let url = ''
        switch (getOS()) {
            case 'Windows':
                url = 'https://firebasestorage.googleapis.com/v0/b/unity-sid.appspot.com/o/ClipboardManagerWindows.zip?alt=media&token=34393595-d788-4227-ad1d-140937a89c45'
                break
            case 'MacOS':
                url = 'https://firebasestorage.googleapis.com/v0/b/unity-sid.appspot.com/o/ClipboardManagerMac.zip?alt=media&token=04092da7-0d03-4497-aa4f-b1f7457306e4'
                break
            default:
                break
        }

        const zipPath = path.join(projectPath, 'ClipboardManager.zip')
        download(url, zipPath)
            .then(url => {
                fs.rmdirSync(clipboardManagerPath, { recursive: true })
                extract(zipPath, { dir: clipboardManagerPath })
                    .then(() => {
                        fs.chmodSync(clipboardManagerPath, '700')
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

module.exports = { getClipboardManagerBinaries }
