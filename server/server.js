const WebSocket = require("ws");
const crypto = require("crypto");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log("Server started on port", PORT);

const rooms = {
	playroom: { password: "play123", players: new Map(), nextPlayerIndex: 0},
	testroom: { password: "test123", players: new Map(), nextPlayerIndex: 0}
};

function uid() {
	return crypto.randomUUID();
}

wss.on("connection", (socket) => {
socket.id = uid();

socket.on("message", (msg) => {
	let data;
	try {
	data = JSON.parse(msg);
	} catch {
	return;
	}

	// ===== JOIN ROOM =====
	if (data.type === "join") {
	const room = rooms[data.room];
	if (!room) {
		socket.send(JSON.stringify({ type: "error", message: "No such room" }));
		return;
	}

	if (data.password !== room.password) {
		socket.send(JSON.stringify({ type: "error", message: "Wrong password" }));
		return;
	}

	if (room.players.size >= 6) {
		socket.send(JSON.stringify({ type: "error", message: "Room full" }));
		return;
	}

	socket.room = data.room;
	socket.player = room.nextPlayerIndex++;
	room.players.set(socket.id, socket);

	const isHost = room.players.size === 1;
	const peersList = Array.from(room.players.values())
        .filter(peer => peer.id !== socket.id)
        .map(peer => ({
            id: peer.id,
            player: peer.player
        }));

	socket.send(JSON.stringify({
		type: "joined",
		id: socket.id,
		player: socket.player,
		host: isHost,
		peers: peersList
	}));

	// Notify existing peers
	for (const [id, peer] of room.players) {
		if (id !== socket.id && peer.readyState === WebSocket.OPEN) {
		peer.send(JSON.stringify({
			type: "peer-joined",
			id: socket.id,
			player: socket.player
		}));
		}
	}

	return;
	}

	// ===== SIGNAL ROUTING =====
	if (data.type === "signal") {
	const room = rooms[socket.room];
	if (!room) return;

	const target = room.players.get(data.to);
	if (target && target.readyState === WebSocket.OPEN) {
		target.send(JSON.stringify({
		type: "signal",
		from: socket.id,
		signal: data.signal
		}));
	}
	}
});

socket.on("close", () => {
	const roomId = socket.room;
	if (!roomId) return;

	const room = rooms[roomId];
	if (!room) return;

	room.players.delete(socket.id);

	// If room is empty, reset player counter
	if (room.players.size === 0) {
		room.nextPlayerIndex = 0;
	} else {
		// Notify remaining peers that someone left (optional but recommended)
		for (const peer of room.players.values()) {
		if (peer.readyState === WebSocket.OPEN) {
			peer.send(JSON.stringify({
			type: "peer-left",
			id: socket.id,
			player: socket.player
			}));
		}
		}
	}
});

});

