// ================== JOIN ==================
function join(room, password) {
	console.log("Connecting WebSocket...");
	console.log("Server is free so this might take a while.");

	socket = new WebSocket(SERVER_URL);

	socket.onopen = () => {
		console.log("WebSocket open");
		socket.send(JSON.stringify({
		type: "join",
		room,
		password
		}));
	};

	socket.onerror = (e) => {
		console.error("WebSocket error", e);
	};

	socket.onmessage = async (e) => {
		const data = JSON.parse(e.data);
		//console.log("Server WS:", data);

		// ===== JOINED =====
		if (data.type === "joined") {
			localId = data.id;
			playerIndex = data.player;
			isHost = data.host;
			peerList = data.peers;
			if (isHost)	console.log("Joined as HOST P"  + playerIndex + ".");
			else		console.log("Joined as GUEST P" + playerIndex + ".");
			for (const p of peerList) {
				if (p.player == 0 ) {hostId = p.id};
				createPeer(p.id, p.player);
				if (isHost) {
					await makeOffer(p.id, p.player);
				}
			}
			return;
		}

		// ===== PEER JOINED =====
		if (data.type === "peer-joined" && isHost) {
			const peerId = data.id;
			const playerNumber = data.player;
			console.log("GUEST P" + playerNumber + " joined the room.");
			createPeer(peerId, playerNumber);
			await makeOffer(peerId, playerNumber);
			return;
		}

		// ===== PEER LEFT =====
		if (data.type === "peer-left" && isHost) {
			const peerId = data.id;
			const playerNumber = data.player;
			console.log("GUEST P" + playerNumber + " left the room.");
			peers.splice(playerNumber, 1);
			return;
		}

		// ===== SIGNAL =====
		if (data.type === "signal") {
			await handleSignal(data);
			return;
		}

		// ===== ROOM FULL / ERROR =====
		if (data.type === "room-full") {
			alert("Room is full (max 6 players)");
			socket.close();
		}
	};
}



// ================== INPUT ==================
document.addEventListener("keydown", (e) => {
	if (k22b.state == 0) return;
	const inputs = {};

	if (e.code === "KeyW"
	||  e.key  === "ArrowUp"){
		inputs.w = true;
	}
	if (e.code === "KeyS"
	||  e.key  === "ArrowDown"){
		inputs.s = true;
	}
	if (e.code === "KeyA"
	||  e.key  === "ArrowLeft"){
		inputs.a = true;
	}
	if (e.code === "KeyD"
	||  e.key  === "ArrowRight"){
		inputs.d = true;
	}
	handleMove(playerIndex, inputs);
});

function handleMove(index, input) {
	const move = { x: 0, y: 0 };
	if (input.w) move.y = -speed;
	if (input.s) move.y =  speed;
	if (input.a) move.x = -speed;
	if (input.d) move.x =  speed;
	players[index].x += move.x;
	players[index].y += move.y;
	if (isHost){
		host_sendBroadcast();
	} else {
		guest_sendReport();
	}
}
