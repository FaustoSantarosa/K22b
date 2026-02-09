//===============  H A N D L E  ===============
function guest_handleBroadcast(e){
	//if (Math.random() > 0.5) return;
	//console.log("Broadcast received.");
	const buffer =
		e.data instanceof Uint8Array
			? e.data
			: new Uint8Array(e.data);

	const { k22bArray, playersArray } = unpackBroadcast(buffer);
	Object.assign(k22b, k22bArray);
	players.length = 0;
	for (const p of playersArray) {
		players.push(p);
	}
}

function guest_handleMilestone(e){
	console.log("Milestone received.")
	const data = JSON.parse(e.data);
	if (data.type === "world") {
		console.log("World milestone:", data);
		playerIndex  = data.player;
		playersTotal = data.total;
		guest_sendWarning("init", true);
	}

}
//=================  S E N D  =================
function guest_sendReport () {
	//console.log("Sending report...")
	const msg = packReport();
	const peer = peers[0];
	if (peer.fast && peer.fast.readyState === "open") {
		peer.fast.send(msg);
	}	
}

function guest_sendWarning (typ, warn) {
	console.log("Sending waring...")
	const msg = JSON.stringify({
		player: playerIndex,
		type: typ,
		warn: warn
	});
	const peer = peers[0];
	if (peer.reliable && peer.reliable.readyState === "open") {
		peer.reliable.send(msg);
	}
}
//=============================================