const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log("Server started on port", PORT);

const rooms = {
  playroom: { password: "play123", players: [] },
  testroom: { password: "test123", players: [] }
};

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (msg) => {
    console.log("Received:", msg.toString());

    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error("Invalid JSON");
      return;
    }

    // JOIN ROOM
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

      if (room.players.length >= 4) {
        socket.send(JSON.stringify({ type: "error", message: "Room full" }));
        return;
      }

      socket.room = data.room;
      room.players.push(socket);

      const isHost = room.players.length === 1;
      const index = room.players.length - 1;

      console.log(`Player joined ${data.room} | host=${isHost}`);

      socket.send(JSON.stringify({
        type: "joined",
        host: isHost,
        index
      }));
      // Notify host that someone joined
    if (!isHost) {
      const hostSocket = room.players[0];
      if (hostSocket.readyState === WebSocket.OPEN) {
        hostSocket.send(JSON.stringify({
          type: "peer-joined"
        }));
      }
    }

      return;
    }

    // SIGNALING (WebRTC)
    if (data.type === "signal") {
      const room = rooms[socket.room];
      if (!room) return;

      room.players.forEach(p => {
        if (p !== socket && p.readyState === WebSocket.OPEN) {
          p.send(JSON.stringify({
            type: "signal",
            signal: data.signal
          }));
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");

    if (!socket.room) return;

    const room = rooms[socket.room];
    room.players = room.players.filter(p => p !== socket);
  });
});
