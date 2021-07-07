const { getUser } = require('./firebaseAuth')
const { addToClipboard } = require('./firebaseDb')

const handleMessage = async (serviceId, data) => {
    status = 0
    try {
        let messageType = data.messageType
        switch (messageType) {
            case 'syncMessage':

                console.log('Sync type message received.')
                await addToClipboard(serviceId, getUser().uid, data.updateMessage)

                break
            default:

                // message type not supported

                break
        }
    }
    catch (err) {
        status = 1
    }

    const response = { 'status': status }
    return response
}

module.exports = { handleMessage }