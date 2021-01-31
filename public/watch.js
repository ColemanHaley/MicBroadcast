let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};


const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");
const mic = document.querySelector("#mic");

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    })
    .then(gotDevices);
  peerConnection.ontrack = event => {
    console.log(event.streams[0].getVideoTracks());
    video.muted=true;
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = !video.muted;
  mic.src = (video.muted ? "/mic-mute.svg" : "mic.svg");
}
async function gotDevices() {
  console.log('heya');
  const devices = await navigator.mediaDevices.enumerateDevices();
  window.deviceInfos = devices;
  for (const deviceInfo of devices) {
    if (deviceInfo.kind === "audiooutput") {
      console.log('yay')
      video.setSinkId(deviceInfo.deviceId);
      if (deviceInfo.label.slice(0,6)==="BlackH") {
        console.log('yaas')
        console.log(deviceInfo.deviceId);
        break
      }
    }
  }
}
