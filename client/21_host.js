function host_handleMessage (e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[data.player].x += data.move.x;
		players[data.player].y += data.move.y;
		checkWin();
		broadcastPlayers("players", players);
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
	broadcast(players);
	console.log("Game initialized");
}

function broadcast(array_name, array){
	channel.send(JSON.stringify({
		type: "state",
		[array_name]: array
	}));
}