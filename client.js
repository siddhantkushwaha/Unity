const net = require('net');

const sendMessage = (port, message) => {
    return new Promise((resolve, reject) => {

        const client = net.createConnection(port, () => {
            try {
               
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

                client.end()

                resolve(responseUnserialized)
            }
            catch (err) {
                reject(err)
            }
        })
        
    })
}

module.exports = { sendMessage }