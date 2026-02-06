function checkCanStart() {
	if (!isHost) return;

	const ready = Object.values(peers)
		.every(p => p.channel?.readyState === "open");

	if (ready) canStart = true;
}

function createPeer(peerId, playerNumber, initiator) {
	const pc = new RTCPeerConnection();

	pc.onicecandidate = e => {
		if (e.candidate) {
		socket.send(JSON.stringify({
			type: "signal",
			from: myId,
			to: peerId,
			signal: e.candidate
		}));
		}
	};

	pc.onconnectionstatechange = () => {
		console.log(peerId, pc.connectionState);
	};
	peers[playerNumber] = { pc };
	if (initiator) {
		const channel = pc.createDataChannel("game");
		setupChannel(peerId, playerNumber, channel);
		peers[playerNumber] = { pc, channel };
	} else {
		pc.ondatachannel = e => {
			setupChannel(peerId, playerNumber, e.channel);
			peers[playerNumber].channel = e.channel;
		};
		peers[playerNumber] = { pc };
	}
}

async function makeOffer(peerId, playerNumber) {
	const pc = peers[playerNumber].pc;
	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);

	socket.send(JSON.stringify({
		type: "signal",
		from: playerIndex,
		to: peerId,
		signal: offer
	}));
}

function setupChannel(peerId, playerNumber, channel) {
	channel.onopen = () => {
		console.log("DC open with", peerId);
		checkCanStart();
	};

	channel.onmessage = e => {
		const msg = JSON.parse(e.data);

		if (isHost) {
			host_handleMessage(playerNumber, msg);
		} else {
			guest_handleMessage(msg)
		}
	};
	peers[playerNumber].channel = channel;
}

async function handleSignal({ from, signal }) {
	const pc = peers[from].pc;

	if (signal.type === "offer") {
		await pc.setRemoteDescription(signal);
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		socket.send(JSON.stringify({
			type: "signal",
			from: playerIndex,
			to: from,
			signal: answer
		}));
	} else if (signal.type === "answer") {
		await pc.setRemoteDescription(signal);
	} else if (signal.candidate) {
		await pc.addIceCandidate(signal);
	}
}

