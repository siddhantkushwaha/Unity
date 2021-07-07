const fs = require('fs')
const net = require('net')
const path = require('path')
const { spawn } = require('child_process')

const { sendMessage } = require('./client')
const { handleMessage } = require('./requestHandler')
const { listenToClipboard } = require('./firebaseDb')
const { loadUser, getUser } = require('./firebaseAuth')
const { getClipboardManagerBinaries } = require('./getClipboardManager')
const { getOS, getUniqueId, terminate, ensurePath, clipboardManagerPort,
	clipboardServerPort, logPath, projectPath } = require('./util')


const serviceId = getUniqueId()
var isFirstCloudUpdate = true

const startService = async () => {
	try {
		const user = await loadUser()
		console.log(`User credentials verified for ${user.email}`)

		ensurePath(logPath)
		console.log('Log directory created.')

		await getClipboardManagerBinaries()
		console.log(`Tools downloaded for ${getOS()}`)

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

					//  this should main thread and all child processes
					if (data.type === 'command' && data.arg === 'stop') {
						terminate(0)
					}
				}
				catch (err) {
					console.log('Error while processing request.')
					console.error(err)
				}
			})

			var isClientConnectionClosed = false

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
					clientSocket.destroy(timeoutMessage)
				}
			}, 5 * 1000)

		})

		server.on('error', err => {
			handleError(err)
		})

		server.listen(clipboardServerPort, () => {
			// no need to log enything
		})

		server.on('close', () => {
			const err = new Error('Unity server closed.')
			handleError(err)
		})

		// ------------------- clipboard manager ----------------------------------------------------

		let executablePath = path.join(projectPath, 'ClipboardManager', 'ClipboardManager')
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

		// ------------------- firebase db clipboard changes --------------------------------

		listenToClipboard(getUser().uid, async (snap) => {
			try {
				if (isFirstCloudUpdate) {
					isFirstCloudUpdate = false
					return
				}

				let content = snap.val()
				if (content.serviceId === serviceId) {
					return
				}

				console.log("Cloud clipboard content updated.")
				console.log(content)

				let updateMessage = {
					messageType: 'updateClipboard',
					updateMessage: content.updateMessage
				}

				const response = await sendMessage(clipboardManagerPort, updateMessage)
				console.log('Response from clipboard manager', response)
			}
			catch (err) {
				console.log('Error while processing cloud update.')
				console.error(err)
			}
		})
	}
	catch (err) {
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