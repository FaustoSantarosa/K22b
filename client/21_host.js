function host_handleMessage (data){
// log message xxx delete in prod
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[data.player].x += data.move.x;
		players[data.player].y += data.move.y;
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

function hostStartGame() {
	if (!canStart) return;
	initGame();
}

// ================== GAME ==================
function initGame() {
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

	for (const peerId in peers) {
		const peer = peers[peerId];
		if (peer.channel && peer.channel.readyState === "open") {
			console.log(peer)
			peer.channel.send(msg);
		}
	}
}