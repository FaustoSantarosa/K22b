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
	if (data.type === "move") {
		players[playerNumber].x += data.move.x;
		players[playerNumber].y += data.move.y;
		checkWin();
		host_sendMilestone("players", players);
	}
}

function host_sendBroadcast(array_name, array) {
	//console.log("Broadcasting...")
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
		type: "milestone",
		[array_name]: array
	});
	peers.forEach(peer => {
		if (peer.reliable && peer.reliable.readyState === "open") {
			peer.reliable.send(msg);
		}
	});
}
function host_sendWorld(peer, msg){
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
	let i = 0;
	peers.forEach((p) => {
		i++;
	});
	playersTotal = i;
	i = 0;
	peers.forEach((p) => {
		i++;
		host_sendWorld(p, "You are P" + i + " of " + playersTotal + ".");
	});
	return;

	let k22b = {
		tick: 0, // 16 bits _range: 0-65535
		state: 1, // 3 bits _range: 0-7
		randomIndex: 1 // 8 bits _range 0-255
	}
	let players = [];
	for (i=0; i<playersTotal; i++){
		players.push(new Player(i*3,0,0,0,63,63,63));
	}
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