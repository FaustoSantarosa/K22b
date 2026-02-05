const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const rooms = {
  playroom: { password: "play123", players: [] },
  testroom: { password: "test123", players: [] }
};

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      const room = rooms[data.room];
      if (!room) return;

      if (data.password !== room.password) {
        socket.send(JSON.stringify({ type: "error", message: "wrong password" }));
        return;
      }

      if (room.players.length >= 4) {
        socket.send(JSON.stringify({ type: "error", message: "room full" }));
        return;
      }

      socket.room = data.room;
      room.players.push(socket);

      socket.send(JSON.stringify({
        type: "joined",
        host: room.players.length === 1,
        index: room.players.length - 1
      }));
    }

    // WebRTC signaling
    if (data.type === "signal") {
      const room = rooms[socket.room];
      if (!room) return;

      room.players.forEach(p => {
        if (p !== socket) {
          p.send(JSON.stringify(data));
        }
      });
    }
  });

  socket.on("close", () => {
    if (!socket.room) return;
    const room = rooms[socket.room];
    room.players = room.players.filter(p => p !== socket);
  });
});
