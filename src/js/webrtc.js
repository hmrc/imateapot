var localVideo;
var localStream;
var remoteVideo;
var peerConnection;
var uuid;
var serverConnection;

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

function pageReady() {
    console.log("pageReady")
    uuid = createUUID();

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    serverConnection = new WebSocket('ws://192.168.160.148:8010');
    serverConnection.onmessage = gotMessageFromServer;

    var videoConstraints = {
        video: true,
        audio: true,
    };

    var screenShareConstraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: 'screen:0',
                maxWidth: 1280,
                maxHeight: 720
            },
            optional: []
        }
    };


    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(videoConstraints).then(getUserMediaSuccess).catch(errorHandler);
        // navigator.mediaDevices.getUserMedia(screenShareConstraints).then(getScreenShareSuccess).catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
}

function getScreenShareSuccess(stream) {
    localStream = stream;
    // localVideo.src = window.URL.createObjectURL(stream);
}

function call(isCaller) {
    console.log("Starting call isCaller: " + isCaller)
    remoteVideo.style.visibility = "visible";
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
    peerConnection.addStream(localStream);

    if (isCaller) {
        peerConnection.createOffer().then(createdDescription).catch(errorHandler);
        serverConnection.send(JSON.stringify({'url': window.location.href}));
    }
}

function hangup() {
    console.log("Hangup call...");
    serverConnection.send(JSON.stringify({'hangup': 'true'}));
    closeRemote();
}

function closeRemote() {
    peerConnection.close();
    peerConnection = null;
    remoteVideo.style.visibility = "hidden";
}

function gotMessageFromServer(message) {
    console.log("WebSocket>> " + JSON.stringify(message))
    if (!peerConnection) call(false);

    var signal = JSON.parse(message.data);

    // Ignore messages from ourself
    if (signal.uuid == uuid) return;

    if (signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
            // Only create answers in response to offers
            //console.log("WebSocket>> ICE Candidate" + JSON.stringify(signal))
            if (signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if (signal.ice) {
        //console.log("WebSocket>> ICE Candidate: " + JSON.stringify(signal))
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    } else if (signal.hangup) {
        closeRemote();
    } else if (signal.url) {
        console.log("Remote URL: " + JSON.stringify(signal.url));
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        console.log("gotIceCandidate from ICE server: " + JSON.stringify(event.candidate));
        serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
    }
}

function createdDescription(description) {
    console.log("createdDescription" + +JSON.stringify(event));

    peerConnection.setLocalDescription(description).then(function () {
        serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log("gotRemoteStream: " + JSON.stringify(event));
    remoteVideo.srcObject = event.streams[0];
}

function errorHandler(error) {
    console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}