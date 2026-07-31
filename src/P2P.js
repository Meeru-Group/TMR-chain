const EventEmitter = require("events");

class P2P extends EventEmitter {
  constructor() {
    super();
    this.peers = [];
  }

  addPeer(peer) {
    if (!this.peers.includes(peer)) {
      this.peers.push(peer);
      console.log("Connected peer:", peer);
    }
  }

  removePeer(peer) {
    this.peers = this.peers.filter(p => p !== peer);
  }

  broadcast(message) {
    console.log("Broadcasting:", message);

    this.peers.forEach(peer => {
      console.log(`Sent to ${peer}`);
    });
  }

  getPeers() {
    return this.peers;
  }
}

module.exports = P2P;
