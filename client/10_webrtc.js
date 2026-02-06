// ================== WEBRTC ==================
function startWebRTC() {
	console.log("Starting WebRTC");

	pc = new RTCPeerConnection();
// if ICE candidate pops
	pc.onicecandidate = (e) => {
		if (e.candidate && socketReady) {
			socket.send(JSON.stringify({
				type: "signal",
				signal: e.candidate
			}));
		}
	};
// if peer connection changes
	pc.onconnectionstatechange = () => {
		console.log("PC state:", pc.connectionState);
	};

	if (isHost) {
	// handle stuff if user is host
		channel = pc.createDataChannel("game");
		channel.onopen = () => {
			console.log("HOST (you) opened DataChannel.");
			channelReady = true;
			initGame();
		};
		channel.onmessage = host_handleMessage;

	} else {
	// handle stuff if user is guest
		pc.ondatachannel = (e) => {
		// when datachannel is received
			channel = e.channel;
			console.log("DataChannel received");
			channel.onopen = () => {
				console.log("HOST (not you) opened DataChannel.");
				channelReady = true;
			};
			channel.onmessage = guest_handleMessage;
		};
		socket.send(JSON.stringify({
		// tell host guest is ready
			type: "signal",
			signal: { type: "ready-for-offer" }
		}));
	}
}