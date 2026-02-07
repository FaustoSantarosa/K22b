function host_handleReport (playerNumber, e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[playerNumber].x += data.move.x;
		players[playerNumber].y += data.move.y;
		checkWin();
		broadcast("players", players);
	}
}

function host_handleWarning (playerNumber, e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[playerNumber].x += data.move.x;
		players[playerNumber].y += data.move.y;
		checkWin();
		broadcast("players", players);
	}
}
function host_sendBroadcast(array_name, array) {
	console.log("Broadcasting...")
	const msg = JSON.stringify({
		type: "state",
		[array_name]: array
	});
	peers.forEach(peer => {
		if (peer.fast && peer.fast.readyState === "open") {
			peer.fast.send(msg);
		}
	});
}

function host_sendMilestone(array_name, array) {
	console.log("Setting milestone...")
	const msg = JSON.stringify({
		type: "state",
		[array_name]: array
	});
	peers.forEach(peer => {
		if (peer.reliable && peer.reliable.readyState === "open") {
			peer.reliable.send(msg);
		}
	});
}


// ========= host stuff============
function checkWin() {
	players.forEach((p, i) => {
		if (Math.abs(p.x - dot.x) < 10 && Math.abs(p.y - dot.y) < 10) {
			alert("Player " + i + " wins!");
		}
	});
}

function checkCanStart() {
	if (!isHost) return;
	if (checkChannels()) canStart = true;
}

function checkChannels(){
	return Object.values(peers)
		.every(p => p.reliable?.readyState === "open");
}

// ================== GAME ==================
function initGame() {
	if (!canStart) return;
	const corners = [
		{ x: 0,				y: 0 },
		{ x: screenW-20,	y: 0 },
		{ x: 0,				y: screenH-20 },
		{ x: screenW-20,	y: screenH-20 }
	];

	players.length = 0;
	for (let i = 0; i < 4; i++) {
		players.push({ ...corners[i] });
	}
	host_sendBroadcast("players", players);
	console.log("Game initialized");
}