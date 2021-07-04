const clipboardManagerPort = 1625
const clipboardServerPort = 1626
const cliServerPort = 1627

const terminate = (code) => {
    process.exit(code)
}

module.exports = { clipboardServerPort, clipboardManagerPort, cliServerPort, terminate }