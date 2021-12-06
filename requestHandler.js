const handleMessage = async (serviceId, data) => {
    let status = 0
    try {
        let messageType = data['messageType']
        switch (messageType) {

            // sent by clipboard manager running on same env
            case 'syncMessage':

                console.log('Sync type message received.')
                // send it to all other connected devices

                break

            // sent by another node
            case 'updateMessage':

                // send to clipboard manager process on my env

                break

            default:

                // message type not supported

                break
        }
    } catch (err) {
        status = 1
    }

    return {'status': status}
}

module.exports = {handleMessage}