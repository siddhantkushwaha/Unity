const net = require('net');

const sendMessage = (port, message) => {
    return new Promise((resolve, reject) => {
        const serverSocket = net.createConnection(port, () => {
            try {

                const messageSerialized = JSON.stringify(message)
                serverSocket.write(messageSerialized)
            }
            catch (err) {
                reject(err)
            }
        }).on('error', err => {
            reject(err)
        })

        serverSocket.on('data', (data) => {
            try {
                const response = data.toString()
                const responseUnserialized = JSON.parse(response)

                serverSocket.end()

                resolve(responseUnserialized)
            }
            catch (err) {
                reject(err)
            }
        })

        var closed = false
        const onClose = had_error => {
            closed = true
            if (had_error) {
                reject(Error('Socket closed because of error.'))
            }
            else {
                resolve(null)
            }
        }
        serverSocket.on('close', had_error => onClose(had_error))
        serverSocket.on('end', had_error => onClose(had_error))

        setTimeout(() => {
            if (!closed) {
                const message = 'Timed out.'
                serverSocket.destroy(message)
                reject(Error(message))
            }
        }, 5 * 1000)
    })
}

module.exports = { sendMessage }