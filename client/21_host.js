//=============================================
function host_handleReport (playerNumber, e){
	//if (Math.random() > 0.5) return;
	const data = JSON.parse(e.data);
	//console.log("Report:", data);
	if (data.type === "move") {
		players[playerNumber].x += data.move.x;
		players[playerNumber].y += data.move.y;
		checkWin();
		host_sendBroadcast("players", players);
	}
}

function host_handleWarning (playerNumber, e){
	const data = JSON.parse(e.data);
	console.log("Warning:", data);
	if (data.type === "init") {
		playersReady[playerNumber] = data.warn;
		if (playersReady.every(Boolean)) startGame();
	}
}

function host_sendBroadcast() {
	console.log("Broadcasting...")
	const msg = packBroadcast();
	/*
	const payload = msg.buffer.slice(
		msg.byteOffset,
		msg.byteOffset + msg.byteLength
	);
	*/
	peers.forEach(peer => {
		if (peer.fast && peer.fast.readyState === "open") {
			peer.fast.send(msg);
		}
	});
}

function host_sendMilestone(array_name, array) {
	console.log("Sending milestone...")
	const msg = JSON.stringify({
		type: "milestone",
		[array_name]: array
	});
	peers.forEach(peer => {
		if (peer.reliable && peer.reliable.readyState === "open") {
			peer.reliable.send(msg);
		}
	});
}
function host_sendWorld(peer, i){
	console.log("Sending World milestone...")
	const msg = JSON.stringify({
		type: "world",
		player: i,
		total: playersTotal
	});
	if (peer.reliable && peer.reliable.readyState === "open") {
		peer.reliable.send(msg);
	}
}
//=============================================

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
	let j = 0;
	peers.forEach((p) => {
		j++;
	});
	playersTotal = j+1;
	playersReady.length = playersTotal;
	j = 0;
	peers.forEach((p) => {
		j++;
		host_sendWorld(p, j);
	});

	const corners = [
		{ x: 0,				y: 0 },
		{ x: screenW-20,	y: 0 },
		{ x: 0,				y: screenH-20 },
		{ x: screenW-20,	y: screenH-20 }
	];

	players.length = 0;
	for (i=0; i < playersTotal; i++){
		players.push(new Player(corners[i]));
	}

	console.log("Initializing game...");
}

function startGame(){
	host_sendBroadcast();
	console.log(">> Game started.")
}