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
let isHost = false;
let canStart = false;
let playerIndex = 0;
let peerIds = [];
let playersTotal = 1;
let k22b;

const playersReady = [];
const players = [];

//

const screenW = 400;
const screenH = 400;


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

