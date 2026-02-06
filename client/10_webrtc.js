function hostStartGame() {
  if (!canStart) return;

  const msg = JSON.stringify({
    type: "game-start"
  });

  for (const peer of Object.values(peers)) {
    peer.channel.send(msg);
  }
initGame();
}

function checkCanStart() {
  if (!isHost) return;

  const ready = Object.values(peers)
    .every(p => p.channel?.readyState === "open");

  if (ready) canStart = true;
}


function createPeer(peerId, initiator) {
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
	peers[peerId] = { pc };
  if (initiator) {
    const channel = pc.createDataChannel("game");
    setupChannel(peerId, channel);
    peers[peerId] = { pc, channel };
  } else {
    pc.ondatachannel = e => {
      setupChannel(peerId, e.channel);
      peers[peerId].channel = e.channel;
    };
    peers[peerId] = { pc };
  }
}


async function makeOffer(peerId) {
  const pc = peers[peerId].pc;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.send(JSON.stringify({
    type: "signal",
    from: myId,
    to: peerId,
    signal: offer
  }));
}

function setupChannel(peerId, channel) {
  channel.onopen = () => {
    console.log("DC open with", peerId);
    checkCanStart();
  };

  channel.onmessage = e => {
    const msg = JSON.parse(e.data);

    if (msg.type === "game-start") {
      startGame(msg);
    }

    if (msg.type === "input") {
      handleRemoteInput(peerId, msg);
    }
  };

  peers[peerId].channel = channel;
}


async function handleSignal({ from, signal }) {
  const pc = peers[from].pc;

  if (signal.type === "offer") {
    await pc.setRemoteDescription(signal);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.send(JSON.stringify({
      type: "signal",
      from: myId,
      to: from,
      signal: answer
    }));
  }

  else if (signal.type === "answer") {
    await pc.setRemoteDescription(signal);
  }

  else if (signal.candidate) {
    await pc.addIceCandidate(signal);
  }
}

