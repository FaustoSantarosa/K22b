function packBroadcast() {
	const totalBits = 27 + players.length * 52;
	const totalBytes = Math.ceil(totalBits / 8);

	const writer = new BitWriter(totalBytes);

	// ---- Global ----
	writer.write(k22b.tick, 16);
	writer.write(k22b.state, 3);
	writer.write(k22b.randomIndex, 8);

	// ---- Players ----
	for (const p of players) {
		writer.write(p.x, 10);
		writer.write(p.y, 10);
		writer.write(p.z, 8);
		writer.write(p.w, 6);
		writer.write(p.health, 6);
		writer.write(p.tank, 6);
		writer.write(p.temperature, 6);
	}

	return writer.getBuffer();
}

function unpackBroadcast(buffer) {
	const reader = new BitReader(buffer);

	const k22bArray = {
		tick: reader.read(16),
		state: reader.read(3),
		randomIndex: reader.read(8)
	};

	const playersArray = [];

	for (let i = 0; i < playersTotal; i++) {
		playersArray.push({
			x: reader.read(10),
			y: reader.read(10),
			z: reader.read(8),
			w: reader.read(6),
			health: reader.read(6),
			tank: reader.read(6),
			temperature: reader.read(6)
		});
	}

	return { k22bArray, playersArray };
}
