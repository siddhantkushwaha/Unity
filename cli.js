const fs = require('fs')
const http = require('http')
const prompt = require('prompt-sync')({ sigint: true })

const { spawn } = require('child_process')
const { sendMessage } = require('./client')
const { terminate, cliServerPort } = require('./util')
const { loadUser, signInWithLink, loginWithEmailAndLink } = require('./firebaseAuth')

let emailToLogin = null
let isVerificationLinkReceived = false

const showIntro = () => {
    const text = "Welcome to Unity CLI."
        + "\n\nSupported Commands are:"
        + "\n1. login  - Log in to Unity."
        + "\n2. start  - Start Unity services to manage clipboard after logging in."
        + "\n3. stop   - Stop Unity services to stop managing clipboard."
        + "\n4. list   - Take a peek at the unity clipboard history."
        + "\n4. select - Select any item from list to clipboard."
        + "\n5. help   - See supported commands."
    console.log(text)
}

const sendLinkForLoginAndWait = email => {
    signInWithLink(email)
        .then(() => {
            console.log('Link sent, login request will timeout in 5 minutes.')
            emailToLogin = email
            setTimeout(() => {
                if (!isVerificationLinkReceived) {
                    console.log('It has been 5 minutes, timing out.')
                    terminate(0)
                }
            }, 5 * 60 * 1000)
        })
        .catch(error => {
            console.log('Could not send link for email verification.', error.message)
            terminate(0)
        })
}

const verifyLoggedIn = () => {
    return new Promise((resolve, reject) => {
        loadUser()
            .then(user => {
                resolve(user)
            })
            .catch(error => {
                reject(error)
            })
    })
}

const server = http.createServer((request, response) => {
    const url = request.url
    if (url.startsWith('/signin')) {
        // send response that link was received, process it later
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('Email authentication link received.');
        response.end();

        const fullUrl = `${request.headers.host}${url}`

        console.log('Login link received, attempting sign in.')

        // avoid timing out
        isVerificationLinkReceived = true

        loginWithEmailAndLink(emailToLogin, fullUrl)
            .then(credentials => {
                console.log(`Login successfull with email ${emailToLogin}.`)
                terminate(0)
            })
            .catch(error => {
                console.log('Login failed.', error.message)
                terminate(0)
            })
    }
    else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('Invalid request to Unity server.');
        response.end();
    }
})

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.log('Another Unity shell alredy active. Please close that session or reuse.')
    }
    else {
        console.log('Some error occured.')
    }
    terminate(0)
})

server.listen(cliServerPort, () => {
    if (process.argv.length > 2) {
        const arg1 = process.argv[2]
        const command = arg1.toLowerCase()
        switch (command) {
            case 'login':

                const email = prompt('Enter an email: ').trim()
                sendLinkForLoginAndWait(email)

                break;
            case 'list':

                verifyLoggedIn()
                    .then(user => {

                        terminate(0)
                    })
                    .catch(error => {
                        console.log('Cannot start clipboard management without loggin in.')
                        terminate(0)
                    })


                break;
            case 'select':

                verifyLoggedIn()
                    .then(user => {

                        terminate(0)
                    })
                    .catch(error => {
                        console.log('Cannot start clipboard management without loggin in.')
                        terminate(0)
                    })

                break;
            case 'start':

                verifyLoggedIn()
                    .then(user => {
                        const service = spawn(
                            "node",
                            [`${__dirname}/service.js`],
                            {
                                stdio: [
                                    'ignore',
                                    fs.openSync('./logs/UnityServer.log', 'a'),
                                    fs.openSync('./logs/UnityServer.log', 'a')
                                ],
                                detached: true,
                                windowsHide: true
                            }
                        )

                        service.on('error', error => {
                            if (error.code === 'ENOENT') {
                                console.log('Could not find Unity Server script.')
                            }
                            terminate(1)
                        })

                        service.on('exit', code => {
                            if (code === 2)
                                console.log('Service already running.')
                            else
                                console.log(`Service exited with exit code ${code}`)
                            terminate(1)
                        })

                        service.on('close', code => {
                            if (code === 2)
                                console.log('Service already running.')
                            else
                                console.log(`Service exited with exit code ${code}`)
                            terminate(1)
                        })

                        // https://nodejs.org/api/child_process.html#child_process_options_detached
                        // By default, the parent will wait for the detached child to exit. 
                        // To prevent the parent from waiting for a given subprocess to exit, use the subprocess.unref()
                        service.unref()

                        // TODO - validate if service came up

                        // time out if everything went well
                        setTimeout(() => {
                            console.log('Unity service was started.')
                            terminate(0)
                        }, 5 * 1000)
                    })
                    .catch(error => {
                        console.log(error)
                        console.log('Cannot start service without loggin in.')

                        terminate(0)
                    })

                break;
            case 'stop':

                sendMessage(1626, { type: 'command', arg: 'stop' })
                    .then(res => {
                        if (res.status === 0) {
                            console.log('Unity service was killed.')
                        }
                        terminate(0)
                    })
                    .catch(err => {
                        console.log('Error occured while try to stop service.')
                        terminate(0)
                    })

                break;
            case 'help':

                showIntro()
                terminate(0)

                break;
            default:

                console.error('Invalid command.')
                showIntro()
                terminate(0)

                break;
        }
    }
    else {
        showIntro()
        terminate(0)
    }
})

setTimeout(() => {

    console.log('\n\nTiming out this session.')
    terminate(0)

}, 10 * 60 * 1000)