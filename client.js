const net = require('net');

const sendMessage = (port, message) => {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(port, () => {
            try {
                console.log('Sending message', message)
                const messageSerialized = JSON.stringify(message)
                client.write(messageSerialized)
            }
            catch (err) {
                reject(err)
            }
        }).on('error', err => {
            reject(err)
        })

        client.on('data', (data) => {
            try {
                const response = data.toString()
                const responseUnserialized = JSON.parse(response)

                console.log('Response received', responseUnserialized)
                client.end()

                resolve(response)
            }
            catch (err) {
                reject(err)
            }
        })
    })
}

module.exports = { sendMessage }