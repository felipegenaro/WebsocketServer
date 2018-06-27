var ws = require('nodejs-websocket')
var dateFormat = require('dateformat')
var mysql = require('mysql')

var date = " at " + dateFormat((new Date()), "dddd HH:MM:ss l, dd/mm/yyyy ")

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "61984634"
})

connection.connect(function(err) {
	if (err) throw err
	console.log("Connected")
	var qry = "CREATE DATABASE IF NOT EXISTS Projeto;"
	checkQry(qry)
	qry = "USE Projeto"
	checkQry(qry)
	qry = "CREATE TABLE IF NOT EXISTS Dados (id int NOT NULL AUTO_INCREMENT, stLocal varchar(15), stOwner varchar(20), stMsg varchar(255), dtDate varchar(50), dtDb varchar(23), PRIMARY KEY (id));"
	checkQry(qry)
	qry = "CREATE TABLE IF NOT EXISTS Modulos (id int NOT NULL AUTO_INCREMENT, stMAC varchar(17), stOwner varchar(20), dtDate varchar(50), dtDb varchar(23), PRIMARY KEY (id));"
	checkQry(qry)
	qry = "CREATE TABLE IF NOT EXISTS Conexao (id int NOT NULL AUTO_INCREMENT, stLocal varchar(15), dtDate varchar(50), dtDb varchar(23), PRIMARY KEY (id));"
	checkQry(qry)
	// connection.query(qry, function(err, rows) {
	// 	if (!err) {
	// 		var content = ('affectedRows: ' + rows.affectedRows + date + "by query: " + qry)
	// 		logFiles(content, "qyrOk")
	// 	}
	// 	else {
	// 		var content = ('error while performng query.' + err + date + "by query: " + qry)
	// 		logFiles(content, "qryErr")
	// 	} 
	// })
})

console.log("Listening...")

var server = ws.createServer(function (conn) {
	var ip = conn.socket.remoteAddress.toString()
	ip = ip.substring(ip.lastIndexOf(':')+1)

	var msgContent = (date + "Connection from: " + ip + date)
	console.log(msgContent)
	// logFiles(msgContent, "msgConn")
	var qry = "INSERT INTO Conexao (stLocal, dtDate, dtDb) VALUES ('"+ip+"', '"+date+"', NOW(3));"
	checkQry(qry)

	conn.on("text", function (msg, owner) {
		if (msg=='overLoad') {
        conn.sendText('s')
      }
      else {
			var msgContent = ("Received Message: " + msg + " From: " + ip + date)
			console.log(msgContent)
			if (msg.includes("MAC")) {
				var res = msg.split(",", 2)
			    var owner = res[0].split("=", 2)
			    var mac = res[1].split("=", 2)
			    mac[1] = mac[1].trim()
			    var qry = "INSERT INTO Modulos (stMAC, stOwner, dtDate, dtDb) SELECT * FROM (SELECT '"+mac[1]+"', '"+owner[1]+"', '"+date+"', NOW(3)) AS tmp WHERE NOT EXISTS (SELECT stMAC FROM Modulos WHERE stMAC = '"+mac[1]+"') LIMIT 1;"
			    // console.log(qry)
			    checkQry(qry)
			}
			else {
				var qry = "INSERT INTO Dados (stLocal, stOwner, stMsg, dtDate, dtDb) VALUES ('"+ip+"', '"+owner+"', '"+msg+"', '"+date+"', NOW(3));"
				checkQry(qry)
			}
		}
		// logFiles(msgContent, "msgLog")
		// checkQry(qry)
	})
	conn.on("close", function (code, reason) {
		var msgContent = (code + " Connection closed " + reason + " from: " + ip + date)
		console.log(msgContent)
		var qry = "INSERT INTO Conexao (stLocal, dtDate, dtDb) VALUES ('"+ip+"', '"+date+"', NOW(3));"
		checkQry(qry)
		// logFiles(msgContent, "msgConn")
	})
	conn.on("error", function (err) {
		var msgContent = ("Erro: " + err + " Caused from: " + ip + date)
		console.log(msgContent)
		logFiles(msgContent, "msgErr")
	})
}).listen(81)	// 82

var fs = require('fs')
function logFiles(content, type) {
	var logger = fs.createWriteStream(type + '.txt', {
	  flags: 'a'
	});

	logger.write(content + "\n")
}

function checkQry(qry) {
	connection.query(qry, function(err, rows) {
		if (!err) {
			var content = ('affectedRows: ' + rows.affectedRows + date + "by query: " + qry)
			logFiles(content, "qyrOk")
		}
		else {
			var content = ('error while performng query.' + err + date + "by query: " + qry)
			logFiles(content, "qryErr")
		} 
	})
}