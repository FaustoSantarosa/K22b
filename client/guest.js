function guest_handleMessage(e){
// log message xxx delete in prod
	const data = JSON.parse(e.data);
	console.log("Data message:", data);
// how guest handles messages
	if (data.type === "state") {
		players.length = 0; // resets players data
		data.players.forEach(p => players.push(p)); //update players data
	}

}