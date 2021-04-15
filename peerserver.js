require("dotenv").config();

const { PeerServer } = require("peer");

const peerServer = PeerServer({ port: process.env.PEER_PORT, path: "/" });

peerServer.on("connection", (client) => {
  console.log(`client connected: ${client.id}`);
});

console.log(`server running on port ${process.env.PEER_PORT}`);
