// ================== JOIN ==================
function join(room, password) {
	console.log("Connecting WebSocket...");

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
		console.log("WS message:", data);

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
				createPeer(p.id, p.player, isHost);
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
			createPeer(peerId, playerNumber, true);
			await makeOffer(peerId, playerNumber);
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
	//if (!checkChannels()) return;

	const move = { x: 0, y: 0 };

	if (e.code === "KeyW"
	||  e.key  === "ArrowUp")
		move.y = -5;
	if (e.code === "KeyS"
	||  e.key  === "ArrowDown")
		move.y =  5;
	if (e.code === "KeyA"
	||  e.key  === "ArrowLeft")
		move.x = -5;
	if (e.code === "KeyD"
	||  e.key  === "ArrowRight")
		move.x =  5;

	if (move.x || move.y) {
		handleMove(move);
	}
});

function handleMove(move) {
	if (isHost){
		players[playerIndex].x += move.x;
		players[playerIndex].y += move.y;
		broadcast("players", players);
	} else {
		inform("move", move);
	}
}


