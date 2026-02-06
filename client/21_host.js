function host_handleMessage (playerNumber, data){
// log message xxx delete in prod
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[playerNumber].x += data.move.x;
		players[playerNumber].y += data.move.y;
		checkWin();
		broadcast("players", players);
	}
}


// host stuff

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
		.every(p => p.channel?.readyState === "open");
}

// ================== GAME ==================
function initGame() {
	if (!canStart) return;
	const corners = [
		{ x: 0, y: 0 },
		{ x: 580, y: 0 },
		{ x: 0, y: 580 },
		{ x: 580, y: 580 }
	];

	players.length = 0;
	for (let i = 0; i < 4; i++) {
		players.push({ ...corners[i] });
	}
	broadcast("players", players);
	console.log("Game initialized");
}

function broadcast(array_name, array) {
	const msg = JSON.stringify({
		type: "state",
		[array_name]: array
	});
	peers.forEach(peer => {
		if (peer.channel && peer.channel.readyState === "open") {
			peer.channel.send(msg);
		}
	});
}