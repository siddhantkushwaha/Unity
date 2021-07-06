const fs = require('fs')
const net = require('net')
const { spawn } = require('child_process')

const { sendMessage } = require('./client')
const { handleMessage } = require('./requestHandler')
const { listenToClipboard } = require('./firebaseDb')
const { loadUser, getUser } = require('./firebaseAuth')
const { getUniqueId, terminate, clipboardManagerPort, clipboardServerPort } = require('./util')

// ------------------------------------------------------------------------------------------

const serviceId = getUniqueId()

var firstUpdate = true
const onClipboardValueChange = snap => {
	if (firstUpdate) {
		firstUpdate = false
		return
	}

	let content = snap.val()
	if (content.serviceId === serviceId) {
		return
	}

	console.log("Cloud clipboard content updated.")
	console.log(content)

	sendMessage(clipboardManagerPort, content.updateMessage)
		.then(response => {
			console.log('Response from clipboard manager', response)
		})
		.catch(err => {
			console.log('Error while sending message to clipboard maanger.')
		})
}

loadUser()
	.then(_ => {

		// ------------------- firebase db clipboard changes --------------------------------
		listenToClipboard(getUser().uid, onClipboardValueChange)

	})
	.catch(err => {
		console.log('User not loaded.', err)
		terminate(1)
	})

// ------------------- clipboard server -----------------------------------------------------

const server = net.createServer(clientSocket => {
	clientSocket.on('data', dataBuffer => {
		try {
			const dataSerialized = dataBuffer.toString()
			const data = JSON.parse(dataSerialized)
			console.log('Data received', data)

			const response = handleMessage(serviceId, data)
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
			console.error(err)
		}
	})

	var closed = false
	const onClose = had_error => {
		closed = true
		if (had_error) {
			console.log('Socket closed because of error.')
		}
	}
	clientSocket.on('close', had_error => onClose(had_error))
	clientSocket.on('end', had_error => onClose(had_error))

	setTimeout(() => {
		if (!closed) {
			console.log('Timing out.')
			clientSocket.destroy('Timed out.')
		}
	}, 5 * 1000)
})

server.on('error', error => {
	let exitCode = 1
	if (error.code === 'EADDRINUSE') {
		console.error('Could not initialize server. Another instance already running.')
		exitCode = 2
	}
	terminate(exitCode)
})

server.listen(clipboardServerPort, () => {
	// no need to log enything
})

// ------------------- clipboard manager ----------------------------------------------------

// const clipboardManagerProcess = spawn(
// 	"D:\\Projects\\ClipboardUtilityWindows\\ClipboardManagerWin\\bin\\Release\\ClipboardManager.exe",
// 	[clipboardManagerPort, clipboardServerPort],
// 	{
// 		stdio: [
// 			'ignore',
// 			fs.openSync('./logs/ClipboardManager.log', 'a'),
// 			fs.openSync('./logs/ClipboardManager.log', 'a')
// 		],
// 		detached: false,
// 		windowsHide: true
// 	}
// )

// clipboardManagerProcess.on('error', error => {
// 	if (error.code === 'ENOENT') {
// 		console.log('Could not find Clipboard Manager binary.')
// 	}
// 	terminate(1)
// })

// clipboardManagerProcess.on('exit', code => {
// 	console.log(`Clipboard manager exited with exit code ${code}`)
// 	terminate(1)
// })

// clipboardManagerProcess.on('close', code => {
// 	console.log(`Clipboard manager exited with exit code ${code}`)
// 	terminate(1)
// })