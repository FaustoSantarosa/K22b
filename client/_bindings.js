// ================== INIT ==================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SERVER_URL = "wss://k22b.onrender.com";

// =============== BINDINGS ===============
let socket;
let socketReady = false;

let pc;
let channel;
let channelReady = false;

let isHost = false;
let playerIndex = 0;

const players = [];
const dot = { x: 295, y: 295 };