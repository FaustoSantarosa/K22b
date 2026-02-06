function guest_handleMessage(data){
// log message xxx delete in prod
	console.log("Data message:", data);
// how guest handles messages
	if (data.type === "state") {
		players.length = 0; // resets players data
		data.players.forEach(p => players.push(p)); //update players data
	}

}


function inform (typ, move) {
	const msg = JSON.stringify({
		player: playerIndex,
		type: typ,
		move
	});

	const peer = peers[0];
	if (peer.channel && peer.channel.readyState === "open") {
		console.log(peer)
		peer.channel.send(msg);
	}
}