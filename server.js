var ws = require('nodejs-websocket')
var dateFormat = require('dateformat')
var mysql = require('mysql')
var fs = require('fs')

// create DB Connection
var connection = mysql.createConnection({
	multipleStatements: true,
	host: "localhost",
	user: "root",
	password: "61984634",
	// database: "Projeto"
})

connection.connect(function(err) {
	if (err) throw err
	console.log("Connected")
	setDB()
})

// creating the websocket server
console.log("Listening...")

var server = ws.createServer(function (conn) {
	var ip = conn.socket.remoteAddress.toString()
		ip = ip.substring(ip.lastIndexOf(':')+1)

	// stablishing connection
	var msgContent = ("Connection from: " + ip + dateNow())
	console.log(msgContent)
	// logFiles(msgContent, "msgConn")
	var qry =  "INSERT INTO Conexao (stLocal, dtDate, dtDb) "
		qry += "VALUES ('"+ip+"', '"+dateNow()+"', NOW(3));"
	checkQry(qry)

	conn.on("text", function (msg) {
		// first msg will always be the MAC address
		if (msg.includes("MAC")) {
			var res = msg.split(",", 2)
			var owner = res[0].split("=", 2)
			var mac = res[1].split("=", 2)
				mac[1] = mac[1].trim()
			var qry =  "INSERT INTO Modulos (stMAC, stOwner, dtDate, dtDb) "
				qry += "SELECT * FROM (SELECT '"+mac[1]+"', '"+owner[1]+"', '"+dateNow()+"', NOW(3)) AS tmp "
			   	qry += "WHERE NOT EXISTS (SELECT stMAC FROM Modulos WHERE stMAC = '"+mac[1]+"') LIMIT 1;"
			checkQry(qry)
		}
		else if (msg.includes("overLoad")) {
			console.log(msg)
			// conn.sendText("")
		}
		// store msgs
		else {
			var res = msg.split(",", 2)
			var owner = res[0].split("=", 2)
			var msg = res[1].split("=", 2)
			var qry =  "INSERT INTO Dados (stLocal, stOwner, stMsg, dtDate, dtDb) "
				qry += "VALUES ('"+ip+"', '"+owner[1]+"', '"+msg[1]+"', '"+dateNow()+"', NOW(3));"
			checkQry(qry)
			var msgContent = ("Received Message: " + msg[1] + " From: " + ip + dateNow())
			console.log(msgContent)
		}
		// logFiles(msgContent, "msgLog")
	})
	// closing connection between client & server
	conn.on("close", function (code, reason) {
		var msgContent = (code + " Connection closed " + reason + " from: " + ip + dateNow())
		console.log(msgContent)
		var qry =  "INSERT INTO Conexao (stLocal, dtDate, dtDb) "
			qry += "VALUES ('"+ip+"', '"+dateNow()+"', NOW(3));"
		checkQry(qry)
		// logFiles(msgContent, "msgConn")
	})
	// txt log of error when reciving msg
	conn.on("error", function (err) {
		var msgContent = ("Erro: " + err + " Caused from: " + ip + dateNow())
		console.log(msgContent)
		logFiles(msgContent, "msgErr")
	})
}).listen(81)	// port

// format the date now
function dateNow() {
	var date = " at " + dateFormat((new Date()), "dddd HH:MM:ss l, dd/mm/yyyy ")
	return date
}

function logFiles(content, type) {
	var logger = fs.createWriteStream(type + '.txt', {
	  flags: 'a'	// append
	});

	logger.write(content + "\n")
}

// set DB env
function setDB() {
	qry =  "CREATE DATABASE IF NOT EXISTS Projeto;"
	qry += "use Projeto;"
	qry += "CREATE TABLE IF NOT EXISTS Dados (id int UNSIGNED AUTO_INCREMENT PRIMARY KEY, stLocal varchar(15), stOwner varchar(20), stMsg varchar(255), dtDate varchar(50), dtDb varchar(23)); "
	qry += "CREATE TABLE IF NOT EXISTS Modulos (id int UNSIGNED AUTO_INCREMENT PRIMARY KEY, stMAC varchar(17), stOwner varchar(20), dtDate varchar(50), dtDb varchar(23)); "
	qry += "CREATE TABLE IF NOT EXISTS Conexao (id int UNSIGNED AUTO_INCREMENT PRIMARY KEY, stLocal varchar(15), dtDate varchar(50), dtDb varchar(23));"
	checkQry(qry)
}

// make txt log query return
function checkQry(qry) {
	connection.query(qry, function(err, rows) {
		if (!err) {
			var content = ('affectedRows: ' + rows.affectedRows + dateNow() + "by query: " + qry)
			logFiles(content, "qyrOk")
		}
		else {
			var content = ('error while performng query.' + err + dateNow() + "by query: " + qry)
			logFiles(content, "qryErr")
		} 
	})
}