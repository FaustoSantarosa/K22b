function createPeer(peerId, playerNumber, initiator) {
	const pc = new RTCPeerConnection();
	peerIds[playerNumber] = peerId;
	pc.onicecandidate = e => {
		if (e.candidate) {
		socket.send(JSON.stringify({
			type: "signal",
			from: localId,
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
		from: localId,
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
	let pc;
	for (i=0; i< peers.length; i++){
		console.log(peerIds[i], from);
		if (peerIds[i] == from) {
			pc = peers[i].pc;
		}
	}
	console.log(pc);
	if (signal.type === "offer") {
		await pc.setRemoteDescription(signal);
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		socket.send(JSON.stringify({
			type: "signal",
			from: localId,
			to: from,
			signal: answer
		}));
	} else if (signal.type === "answer") {
		await pc.setRemoteDescription(signal);
	} else if (signal.candidate) {
		await pc.addIceCandidate(signal);
	}
}

