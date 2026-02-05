const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================== STATE ==================
let socket;
let socketReady = false;

let pc;
let channel;
let channelReady = false;

let isHost = false;
let playerIndex = 0;

const players = [];
const dot = { x: 295, y: 295 };

// CHANGE THIS
const SERVER_URL = "wss://k22b.onrender.com";

// ================== JOIN ==================
function join(room, password) {
  console.log("Connecting WebSocket...");

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    socketReady = true;
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
    console.log("WS message:", e.data);
    const data = JSON.parse(e.data);
    

  if (data.type === "peer-joined" && isHost) {
  console.log("Peer joined — creating offer");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.send(JSON.stringify({
    type: "signal",
    signal: offer
  }));

    if (data.type === "joined") {
      isHost = data.host;
      playerIndex = data.index;
      console.log("Joined room | Host:", isHost);
      startWebRTC();
    }
    
if (data.type === "signal" && data.signal.type === "ready-for-offer" && isHost) {
  console.log("Peer is ready — creating offer");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.send(JSON.stringify({
    type: "signal",
    signal: offer
  }));
}
    if (data.type === "signal") {
      console.log("Signal received");

      if (data.signal.type === "offer") {
        await pc.setRemoteDescription(data.signal);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: "signal", signal: answer }));
      }

      if (data.signal.type === "answer") {
        await pc.setRemoteDescription(data.signal);
      }

      if (data.signal.candidate) {
        await pc.addIceCandidate(data.signal);
      }
    }
  };
}

// ================== WEBRTC ==================
function startWebRTC() {
  console.log("Starting WebRTC");

  pc = new RTCPeerConnection();

  pc.onicecandidate = (e) => {
    if (e.candidate && socketReady) {
      console.log("Sending ICE candidate");
      socket.send(JSON.stringify({
        type: "signal",
        signal: e.candidate
      }));
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("PC state:", pc.connectionState);
  };

  if (isHost) {
    channel = pc.createDataChannel("game");

    channel.onopen = () => {
      channelReady = true;
      console.log("DataChannel open (host)");
      initGame();
    };

    channel.onmessage = onMessage;

  } else {
    pc.ondatachannel = (e) => {
      channel = e.channel;
      console.log("DataChannel received");

      channel.onopen = () => {
        channelReady = true;
        console.log("DataChannel open (client)");
      };

      channel.onmessage = onMessage;
    };
    socket.send(JSON.stringify({
      type: "signal",
      signal: { type: "ready-for-offer" }
    }));
  }
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

function onMessage(e) {
  const data = JSON.parse(e.data);
  console.log("Data message:", data);
}

  
  if (isHost && data.type === "move") {
    players[playerIndex].x += data.move.x;
    players[playerIndex].y += data.move.y;

    checkWin();

    channel.send(JSON.stringify({
      type: "state",
      players
    }));
  }

  if (!isHost && data.type === "state") {
    players.length = 0;
    data.players.forEach(p => players.push(p));
  }
}

function checkWin() {
  players.forEach((p, i) => {
    if (Math.abs(p.x - dot.x) < 10 && Math.abs(p.y - dot.y) < 10) {
      alert("Player " + i + " wins!");
    }
  });
}

// ================== INPUT ==================
document.addEventListener("keydown", (e) => {
  if (!channel) {
    console.log("No data channel yet");
    return;
  }

  if (channel.readyState !== "open") {
    console.log("DataChannel not open yet:", channel.readyState);
    return;
  }

  const move = { x: 0, y: 0 };

  if (e.key === "ArrowUp") move.y = -5;
  if (e.key === "ArrowDown") move.y = 5;
  if (e.key === "ArrowLeft") move.x = -5;
  if (e.key === "ArrowRight") move.x = 5;

  if (move.x !== 0 || move.y !== 0) {
    console.log("Sending move", move);
    channel.send(JSON.stringify({ type: "move", move }));
  }
});


// ================== DRAW ==================
function draw() {
  ctx.clearRect(0, 0, 600, 600);

  ctx.fillStyle = "red";
  ctx.fillRect(dot.x, dot.y, 10, 10);

  ctx.fillStyle = "blue";
  players.forEach(p => ctx.fillRect(p.x, p.y, 20, 20));

  requestAnimationFrame(draw);
}

draw();