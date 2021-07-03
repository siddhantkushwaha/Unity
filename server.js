/*
    Listen to incoming requests
        1. From clipboard managers
        2. From UI  
*/

const net = require('net');


const server = net.createServer(socket => {
    socket.on('data', data => {
        try {
            const dataSerialized = data.toString()

            
            console.log('Data received', dataSerialized)

            const responseSerialized = handleMessage(dataSerialized)
            console.log('Sending response to client', responseSerialized)
            
            socket.write(responseSerialized)
            socket.end()
        }
        catch (err) {
            console.error(err)
        }
    })
}).on('error', err => {
    console.error('Could not initialize server.', err)
})

const handleMessage = data => {
    const jsonData = JSON.parse(data)

    // consume json data, send response
   
    const response = {
        'status': 0,
    }
    const responseSerialized = JSON.stringify(response)
    return responseSerialized
}

server.listen(1626, () => {
    console.log('Unity server listenting on', server.address().port);
})

