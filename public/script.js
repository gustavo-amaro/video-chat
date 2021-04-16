const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const idList = document.getElementById("id-list");
const myPeer = new Peer(undefined, {
  host: "peerserver.quizclass.com.br",
  secure: true,
});

const myVideo = document.createElement("video");

myVideo.muted = true;

const peers = {};

const getUserMedia =
  navigator.mediaDevices.getUserMedia ||
  navigator.mediaDevices.webkitGetUserMedia ||
  navigator.mediaDevices.mozGetUserMedia;

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  console.log(ROOM_ID);
  socket.emit("join-room", ROOM_ID, id);

  getUserMedia({
    video: true,
    audio: true,
  }).then((stream) => {
    addVideoStream(myVideo, stream);

    socket.on("user-connected", (userId) => {
      const audio = new Audio("notification.wav");
      audio.play();
      connectToNewUser(userId, stream);
    });
  });
});

myPeer.on("call", (call) => {
  peers[call.peer] = call;

  getUserMedia({
    video: true,
    audio: true,
  }).then((stream) => {
    call.answer(stream, peers);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
      video.remove();
    });
  });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);

  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
