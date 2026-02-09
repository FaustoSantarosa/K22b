// ================== INIT ==================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SERVER_URL = "wss://k22b.onrender.com";

// =============== BINDINGS ===============
let socket;
let socketReady = false;

const peers = []; 
let localId;
let hostId;
let inputs;
let isHost = false;
let canStart = false;
let playerIndex = 0;
let peerIds = [];
let playersTotal = 1;

const playersReady = [];
const players = [];
const k22b = {
	tick: 0, // 16 bits _range: 0-65535
	state: 0, // 3 bits _range: 0-7
	randomIndex: 1 // 8 bits _range 0-255
};

//

const screenW = 400;
const screenH = 400;
const speed = 5;

//

const RELIABLE_CONFIG = {
	ordered: true
};
const FAST_CONFIG = {
	ordered: false,
	maxRetransmits: 0
};


// =======================================
const dot = { x: screenW/2 -5, y: screenH/2 -5 };

