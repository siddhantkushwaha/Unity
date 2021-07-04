const fs = require('fs')
const net = require('net')

const { terminate } = require('./util')
const { spawn } = require('child_process')
const { handleMessage } = require('./requestHandler')

const clipboardManagerPort = 1625
const clipboardServerPort = 1626

// ------------------- clipboard server -----------------------------------------------------

const server = net.createServer(socket => {
	socket.on('data', dataBuffer => {
		try {
			const dataSerialized = dataBuffer.toString()
			const data = JSON.parse(dataSerialized)
			console.log('Data received', data)

			const response = handleMessage(data)
			console.log('Sending response to client', response)

			const responseSerialized = JSON.stringify(response)
			socket.write(responseSerialized)
			socket.end()

			//  this should main thread and all child processes
			if (data.type === 'command' && data.arg === 'stop') {
				terminate(0)
			}
		}
		catch (err) {
			console.error(err)
		}
	})
})

server.on('error', error => {
	if (error.code === 'EADDRINUSE') {
		console.error('Could not initialize server. Another instance already running.')
	}
	terminate(1)
})

server.listen(clipboardServerPort, () => {
	// no need to log enything
})

// ------------------- clipboard manager ----------------------------------------------------

const clipboardManagerProcess = spawn(
	"D:\\Projects\\ClipboardUtilityWindows\\ClipboardManagerWin\\bin\\Release\\ClipboardManager.exe",
	[clipboardManagerPort, clipboardServerPort],
	{
		stdio: [
			'ignore',
			fs.openSync('./logs/ClipboardManager.log', 'a'),
			fs.openSync('./logs/ClipboardManager.log', 'a')
		],
		detached: false,
		windowsHide: true
	}
)

clipboardManagerProcess.on('error', error => {
	if (error.code === 'ENOENT') {
		console.log('Could not find Clipboard Manager binary.')
	}
	terminate(1)
})

clipboardManagerProcess.on('exit', code => {
	console.log(`Clipboard manager exited with exit code ${code}`)
	terminate(1)
})

clipboardManagerProcess.on('close', code => {
	console.log(`Clipboard manager exited with exit code ${code}`)
	terminate(1)
})
