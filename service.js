const fs = require('fs')
const net = require('net')
const path = require('path')
const {spawn} = require('child_process')

const {handleMessage} = require('./requestHandler')
const {getClipboardManagerBinaries} = require('./getClipboardManagerFromWeb')
const {
    getOS,
    getUniqueId,
    terminate,
    ensurePath,
    clipboardManagerPort,
    clipboardServerPort,
    logPath,
    projectPath
} = require('./util')


const serviceId = getUniqueId()
const childProcesses = []


const startService = async () => {
    try {
        ensurePath(logPath)
        console.log('Log directory created.')

        // await getClipboardManagerBinaries()
        // console.log(`Tools downloaded for ${getOS()}`)

        // ------------------- clipboard server -----------------------------------------------------
        const server = net.createServer(clientSocket => {
            clientSocket.on('data', async (dataBuffer) => {
                try {
                    const dataSerialized = dataBuffer.toString()
                    const data = JSON.parse(dataSerialized)
                    console.log('Data received', data)

                    const response = await handleMessage(serviceId, data)
                    console.log('Sending response to client', response)

                    const responseSerialized = JSON.stringify(response)
                    clientSocket.write(responseSerialized)
                    clientSocket.end()

                    // this should kill main thread and all child processes
                    if (data['messageType'] === 'command' && data['arg'] === 'stop') {

                        // killing spawned processes (clipboard manager) on MacOS explicitly
                        console.log(childProcesses)
                        for (const p of childProcesses) {
                            p.kill()
                        }

                        terminate(0)
                    }
                } catch (err) {
                    console.log('Error while processing request.')
                    console.error(err)
                }
            })

            let isClientConnectionClosed = false

            const onClose = had_error => {
                isClientConnectionClosed = true
                if (had_error) console.log('Socket closed because of error.')
            }

            clientSocket.on('close', had_error => onClose(had_error))
            clientSocket.on('end', had_error => onClose(had_error))

            setTimeout(() => {
                let timeoutMessage = 'Client connection was timed out.'
                if (!isClientConnectionClosed) {
                    console.log(timeoutMessage)
                    clientSocket.destroy(Error(timeoutMessage))
                }
            }, 5 * 1000)
        })

        server.on('error', err => {
            handleError(err)
        })

        server.on('close', () => {
            const err = new Error('Unity server closed.')
            handleError(err)
        })

        // start listening on port
        server.listen(clipboardServerPort, () => {
            // no need to log anything
        })

        // ------------------- clipboard manager ----------------------------------------------------

        // let executablePath = path.join(projectPath, 'ClipboardManager', 'ClipboardManager')
        let executablePath = './assets/ClipboardManager'
        if (getOS() === 'Windows')
            executablePath += '.exe'

        fs.chmodSync(executablePath, '700')

        const clipboardManagerProcess = spawn(
            executablePath,
            [clipboardManagerPort, clipboardServerPort],
            {
                stdio: [
                    'ignore',
                    fs.openSync(path.join(logPath, 'ClipboardManager.log'), 'a'),
                    fs.openSync(path.join(logPath, 'ClipboardManager.log'), 'a')
                ],
                detached: false,
                windowsHide: true
            }
        )

        childProcesses.push(clipboardManagerProcess)

        clipboardManagerProcess.on('error', err => {
            handleError(err)
        })

        const onClipboardManagerClose = (code) => {
            let message = `Clipboard manager process exited with code ${code}.`
            if (code === 1) message = 'Clipboard manager process already active.'
            const err = new Error(message)
            handleError(err)
        }

        clipboardManagerProcess.on('exit', code => onClipboardManagerClose(code))
        clipboardManagerProcess.on('close', code => onClipboardManagerClose(code))

    } catch (err) {
        handleError(err)
    }
}

const handleError = (err) => {
    console.log(err.message, 'Exiting.')
    terminate(1)
}

startService()
    .then(() => {
        console.log('Service has started.')
    })
    .catch(err => {
    })