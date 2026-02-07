function createPeer(peerId, playerNumber) {
	console.log("Creating P" + playerNumber + " peer...")
	const pc = new RTCPeerConnection();
	peerIds[playerNumber] = peerId;
	
	pc.onicecandidate = e => {
		if (e.candidate) {
			console.log("Sending candidate signal to peer...")
			socket.send(JSON.stringify({
				type: "signal",
				from: localId,
				to: peerId,
				signal: e.candidate
			}));
		}
	};
	pc.onconnectionstatechange = () => {
		const begi = pc.connectionState.endsWith('d') ? '>> ' : '';
		const stat = pc.connectionState.endsWith('d') ? '.' : '...';
		console.log(begi + "P" + playerNumber +" "+ pc.connectionState + stat);
	};
	peers[playerNumber] = { pc };
	if (isHost) {
		const channel_reliable	= pc.createDataChannel("reliable", RELIABLE_CONFIG);
		const channel_fast		= pc.createDataChannel("fast", FAST_CONFIG);
		channel_fast.binaryType = "arraybuffer";
		reliableChannel	(playerNumber, channel_reliable);
		fastChannel		(playerNumber, channel_fast);
		peers[playerNumber] = {
			pc,
			reliable: channel_reliable,
			fast: channel_fast
		};
	} else {
		pc.ondatachannel = e => {
			const channel = e.channel;

			if (channel.label === "reliable") {
				reliableChannel(playerNumber, channel);
				peers[playerNumber].reliable = channel;

			} else if (channel.label === "fast") {
				fastChannel(playerNumber, channel);
				peers[playerNumber].fast = channel;
				peers[playerNumber].fast.binaryType = "arraybuffer";

			} else {
				console.warn("Unknown data channel:", channel.label);
			}
		};
	}
}

async function makeOffer(peerId, playerNumber) {
	console.log("Making offer to GUEST P" + playerNumber+ "...")
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

function reliableChannel(playerNumber, channel) {
	console.log("Setting up reliable channel to P" + playerNumber +"...")
	channel.onopen = () => {
		console.log(">> Reliable DC open with P" + playerNumber +".");
		checkCanStart();
	};
	channel.onmessage = e => {
		if (isHost) {
			host_handleWarning(playerNumber, e);
		} else {
			guest_handleMilestone(e)
		}
	};
	//peers[playerNumber].channel = channel;
}

function fastChannel(playerNumber, channel) {
	console.log("Setting up fast channel to P" + playerNumber +"...")
	channel.onopen = () => {
		console.log(">> Fast DC open with P" + playerNumber +".");
		checkCanStart();
	};
	channel.onmessage = e => {
		if (isHost) {
			host_handleReport(playerNumber, e);
		} else {
			guest_handleBroadcast(e)
		}
	};
	//peers[playerNumber].channel = channel;
}

async function handleSignal({ from, signal }) {
	console.log("Handling signal...")
	let pc;
	let pj;
	for (i=0; i< peers.length; i++){
		if (peerIds[i] == from) {
			pc = peers[i].pc;
			pj = i;
		}
	}
	if (signal.type === "offer") {
		console.log("Offer received from HOST P"+ pj +".");
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
		console.log("Answer received from GUEST P"+ pj +".");
		await pc.setRemoteDescription(signal);
	} else if (signal.candidate) {
		console.log("Candidate received from P"+ pj +".");
		await pc.addIceCandidate(signal);
	}
}

