const { getUser } = require('./firebaseAuth')
const { addToClipboard } = require('./firebaseDb')

const handleMessage = (serviceId, data) => {
    
    let messageType = data.messageType
    switch(messageType) {
        case 'syncMessage':

            console.log('Sync type message received.')
            addToClipboard(serviceId, getUser().uid, data.updateMessage)

            break
        default:
            break
    }

    const response = {
        'status': 0,
    }
    return response
}

module.exports = { handleMessage }