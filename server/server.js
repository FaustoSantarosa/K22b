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
      const peerIds = [...room.players.keys()].filter(id => id !== socket.id);

      socket.send(JSON.stringify({
        type: "joined",
        id: socket.id,
        player: socket.player,
        host: isHost,
        peers: peerIds
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
    if (!socket.room) return;

    const room = rooms[socket.room];
    room.players.delete(socket.id);

    // Notify peers
    for (const peer of room.players.values()) {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(JSON.stringify({
          type: "peer-left",
          id: socket.id
        }));
      }
    }
  });
});

