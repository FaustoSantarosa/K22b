function host_handleMessage (e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Data message:", data);
// how host handles messages
	if (data.type === "move") {
		players[data.player].x += data.move.x;
		players[data.player].y += data.move.y;
		checkWin();
		channel.send(JSON.stringify({
			type: "state",
			players
		}));
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