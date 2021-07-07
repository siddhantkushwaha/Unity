const os = require('os')
const fs = require('fs')
const firebase = require('firebase/app')
const firebaseauth = require('firebase/auth')

const credentials = require('./config/firebaseConfig.json')
const { cliServerPort, userPath, projectPath, ensurePath } = require('./util')

firebase.initializeApp(credentials)

const saveUser = user => {
    return new Promise((resolve, reject) => {
        ensurePath(projectPath)
            .then(_path => {
                const userSerialized = JSON.stringify(user.toJSON())
                fs.writeFile(userPath, userSerialized, error => {
                    if (error)
                        reject(error)
                    else
                        resolve()
                })
            })
            .catch(err => {
                reject(err)
            })
    })
}

const loadUser = () => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(userPath)) {
            try {
                const data = fs.readFileSync(userPath).toString()
                const dataUnserialized = JSON.parse(data)
                const user = new firebase.User(dataUnserialized, dataUnserialized['stsTokenManager'], dataUnserialized)

                firebase.auth().updateCurrentUser(user)
                    .then(() => {
                        user.reload()
                            .then(() => {
                                resolve(user)
                            })
                            .catch(err => {
                                reject(err)
                            })
                    })
                    .catch(err => {
                        reject(err)
                    })
            }
            catch (error) {
                reject(error)
            }
        }
        else {
            const error = new Error('No user found.')
            reject(error)
        }
    })
}

const getUser = () => {
    return firebase.auth().currentUser
}

const signInWithLink = (email) => {
    return new Promise((resolve, reject) => {
        var actionCodeSettings = {
            url: `http://localhost:${cliServerPort}/signin/`,
            handleCodeInApp: true
        }
        firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(() => {
                resolve()
            })
            .catch(error => {
                reject(error)
            })
    })
}

const loginWithEmailAndLink = (email, link) => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailLink(email, link)
            .then(credentials => {
                const user = credentials.user
                saveUser(user)
                    .then(() => {
                        resolve(credentials)
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = { getUser, loadUser, signInWithLink, loginWithEmailAndLink }