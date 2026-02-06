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
		socket.send(JSON.stringify({
			type: typ,
			from: myId,
			to: peer,
			player: playerIndex,
			move
		}));
	}
}

function sendToHost() {
  if (!channel || channel.readyState !== "open") return;

  const msg = JSON.stringify({
    type: "state",
    data: "hello"
  });
  channel.send(msg); // guest only has 1 channel → host
}