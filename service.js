const fs = require('fs')
const net = require('net')
const { terminate } = require('./util')
const { spawn } = require('child_process')
const { handleMessage } = require('./requestHandler')

const clipboardManagerPort = 1625
const clipboardServerPort = 1626

// ------------------- utility functions ----------------------------------------------------

const terminate = (code) => {
	// killing main process should kill everything
	process.exit(code)
}

// ------------------- clipboard server -----------------------------------------------------

const server = net.createServer(socket => {
	socket.on('data', data => {
		try {
			const dataSerialized = data.toString()
			console.log('Data received', dataSerialized)

			const responseSerialized = handleMessage(dataSerialized)
			console.log('Sending response to client', responseSerialized)

			socket.write(responseSerialized)
			socket.end()
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
	"D:\\Projects\\ClipboardUtilityWindows\\ClipboardManagerWin\\bin\\Release\\ClipboardManagerWindows.exe",
	[clipboardManagerPort],
	{
		stdio: [
			'ignore',
			fs.openSync('./logs/ClipboardManager.log', 'a'),
			fs.openSync('./logs/ClipboardManager.log', 'a')
		],
		detached: false
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