var ws = null;

function connect() {
	ws = new WebSocket("ws://localhost:81");
}

function alo() {
	ws.send("overLoad");
}