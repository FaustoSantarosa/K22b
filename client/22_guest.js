//=============================================
function guest_handleBroadcast(e){
	//if (Math.random() > 0.5) return;
	//console.log("Broadcast:", data);
	players.length = 0;
	unpackBroadcast(e).forEach((p) => {
		players.push(p);
	});

}

function guest_handleMilestone(e){
	console.log("Milestone received.")
	const data = JSON.parse(e.data);
	if (data.type === "world") {
		console.log("World milestone:", data);
		playerIndex = data.player;
	}

}

function guest_sendReport (typ, move) {
	//console.log("Sending report...")
	const msg = JSON.stringify({
		player: playerIndex,
		type: typ,
		move
	});
	const peer = peers[0];
	if (peer.fast && peer.fast.readyState === "open") {
		console.log(peer)
		peer.fast.send(msg);
	}
}

function guest_sendWarning (typ, move) {
	console.log("Sending waring...")
	const msg = JSON.stringify({
		player: playerIndex,
		type: typ,
		move
	});
	const peer = peers[0];
	if (peer.reliable && peer.reliable.readyState === "open") {
		console.log(peer)
		peer.reliable.send(msg);
	}
}
//=============================================