var ws = require('nodejs-websocket')
var dateFormat = require('dateformat')
var date = dateFormat((new Date()), "dddd HH:MM:ss, dd/mm/yyyy ")

console.log("Listening...")

var server = ws.createServer(function (conn) {
	var ip = conn.socket.remoteAddress.toString()
	ip = ip.substring(ip.lastIndexOf(':')+1)

	var msgContent = (date + "Connection from: " + ip)
	console.log(msgContent)
	logFiles(msgContent, "msgConn")

	conn.on("text", function (msg) {
		var msgContent = ('Received Message: ' + msg + ' From: ' + ip + ' at ' + date)
		console.log(msgContent)
		logFiles(msgContent, "msgLog")
	})
	conn.on("close", function (code, reason) {
		var msgContent = (code + " Connection closed " + reason + " from: " + ip + " at " + date)
		console.log(msgContent)
		logFiles(msgContent, "msgConn")
	})
	conn.on("error", function (err) {
		var msgContent = ("Erro: " + err + " Caused from: " + ip + " at " + date)
		console.log(msgContent)
		logFiles(msgContent, "msgErr")
	})
}).listen(81)	// 82

var fs = require('fs')
function logFiles(content, type) {
	var logger = fs.createWriteStream(type + '.txt', {
	  flags: 'a'
	});

	logger.write(content + "\n");
}