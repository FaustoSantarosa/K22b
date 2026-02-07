function guest_handleBroadcast(e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Broadcast:", data);
// how guest handles messages
	if (data.type === "state") {
		players.length = 0; // resets players data
		data.players.forEach(p => players.push(p)); //update players data
	}

}

function guest_handleMilestone(e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Milestone:", data);
// how guest handles messages
	if (data.type === "state") {
		players.length = 0; // resets players data
		data.players.forEach(p => players.push(p)); //update players data
	}

}

function guest_sendReport (typ, move) {
	console.log("Sending report...")
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