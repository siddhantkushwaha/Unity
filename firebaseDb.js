const firebase = require('firebase/app')
const firebaseDatabase = require('firebase/database')

const { getUniqueId } = require('./util')
const firebaseAuth = require('./firebaseAuth')

const addToClipboard = async (serviceId, userId, update) => {
    var itemId = null
    try {
        let updateMsg = {
            serviceId: serviceId,
            itemId: getUniqueId(),
            updateMessage: update
        }
        await firebase.database().ref(`users/${userId}/clipboard`).set(updateMsg)

        itemId = update.id
    }
    catch (err) {
        itemId = false
        console.error(err)
    }
    return itemId
}

const listenToClipboard = (userId, callback) => {
    firebase.database().ref(`users/${userId}/clipboard`)
        .on('value', snapshot => {
            callback(snapshot)
        })
}

module.exports = { addToClipboard, listenToClipboard }