// ================== JOIN ==================
function join(room, password) {
	console.log("Connecting WebSocket...");

	socket = new WebSocket(SERVER_URL);

	socket.onopen = () => {
		socketReady = true;
		console.log("WebSocket open");
		socket.send(JSON.stringify({ type: "join", room, password }));
	};

	socket.onerror = (e) => {
		console.error("WebSocket error", e);
	};

	socket.onmessage = async (e) => {
		console.log("WS message:", e.data);
		const data = JSON.parse(e.data);

		// ===== JOINED =====
		if (data.type === "joined") {
			isHost = data.host;
			playerIndex = data.index;
			console.log("Player " +data.index+ "joined room | Host:", isHost);
			startWebRTC(); // ---->
			return;
		}

		// ===== PEER JOINED =====
		if (data.type === "peer-joined") {
			console.log("Peer joined");
			return;
		}

		// ===== SIGNAL =====
		if (data.type === "signal") {
			const signal = data.signal;

			if (signal.type === "ready-for-offer" && isHost) {
				console.log("Creating offer");
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				socket.send(JSON.stringify({ type: "signal", signal: offer }));
				return;
			}

			if (signal.type === "offer") {
				console.log("Received offer");
				await pc.setRemoteDescription(signal);
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(JSON.stringify({ type: "signal", signal: answer }));
				return;
			}

			if (signal.type === "answer") {
				console.log("Received answer");
				await pc.setRemoteDescription(signal);
				return;
			}

			if (signal.candidate) {
				console.log("Received ICE");
				await pc.addIceCandidate(signal);
			}
		}
	};
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

	console.log("Game initialized");
}


// ================== INPUT ==================
document.addEventListener("keydown", (e) => {
	if (!channel || channel.readyState !== "open") return;

	const move = { x: 0, y: 0 };

	if (e.key === "ArrowUp") move.y = -5;
	if (e.key === "ArrowDown") move.y = 5;
	if (e.key === "ArrowLeft") move.x = -5;
	if (e.key === "ArrowRight") move.x = 5;

	if (move.x || move.y) {
		handleMove(move);
	}
});

function handleMove(move) {
	players[playerIndex].x += move.x;
	players[playerIndex].y += move.y;
	if (!isHost) {
		channel.send(JSON.stringify({player: playerIndex, type: "move", move }));
	}
}


