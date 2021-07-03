const os = require('os')
const fs = require('fs')
const firebase = require('firebase/app')
const firebaseauth = require('firebase/auth')
const credentials = require('./config/firebaseConfig.json')

firebase.initializeApp(credentials)

const projectPath = `${os.homedir()}/.projectunity`
const userPath = `${projectPath}/user.json`

const signUpWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(credentials => {
                resolve(credentials)
            })
            .catch(error => {
                reject(error)
            })
    })
}

const signInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(credentials => {
                resolve(credentials)
            })
            .catch(error => {
                const errorCode = error.code
                const errorMessage = error.message
                switch (errorCode) {
                    case 'auth/invalid-email':
                        reject(error)
                        break;
                    case 'auth/user-not-found':
                        signUpWithEmailAndPassword(email, password)
                            .then(credentials => resolve(credentials))
                            .catch(error => reject(error))
                        break;
                    case 'auth/wrong-password':
                        reject(error)
                        break;
                    case 'auth/user-disabled':
                        reject(error)
                        break;
                }
            })
    })
}

const saveUser = user => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(projectPath)) {
            fs.mkdir(projectPath, error => {
                if (error)
                    reject(error)
                else {
                    const userSerialized = JSON.stringify(user.toJSON())
                    fs.writeFile(userPath, userSerialized, error => {
                        if (error)
                            reject(error)
                        else
                            resolve()
                    })
                }
            })
        }
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
                user.reload()

                resolve(user)
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

const signInWithLink = (email) => {
    return new Promise((resolve, reject) => {
        var actionCodeSettings = {
            url: 'http://localhost:1627/signin/',
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

module.exports = { loadUser, signInWithLink, loginWithEmailAndLink }