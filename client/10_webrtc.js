socket.onmessage = async (e) => {
  const data = JSON.parse(e.data);

  if (data.type === "joined") {
    myId = data.id;
    isHost = data.host;

    // Create PCs for already-connected peers
    for (const peerId of data.peers) {
      createPeer(peerId, isHost);
      if (isHost) await makeOffer(peerId);
    }
  }

  if (data.type === "peer-joined" && isHost) {
    const peerId = data.id;
    createPeer(peerId, true);
    await makeOffer(peerId);
  }

  if (data.type === "signal") {
    await handleSignal(data);
  }
};

function hostStartGame() {
  if (!canStart) return;

  const msg = JSON.stringify({
    type: "game-start",
    seed: Math.random()
  });

  for (const peer of Object.values(peers)) {
    peer.channel.send(msg);
  }

  startGame({ seed });
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
