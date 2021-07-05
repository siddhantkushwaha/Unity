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

        serverSocket.on('close', (had_error) => {
            if (had_error){
                console.log('Socket closed because of error.')
            }
        })
        
        serverSocket.on('end', (had_error) => {
            if (had_error){
                console.log('Socket closed because of error.')
            }
        })
    })
}

module.exports = { sendMessage }