const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {desktopCapturer}  = require('electron')
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;

let desktopSharing;
var methods = {}; 

    methods.createPeerConnection = function() {
      try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
      } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
      }
    }
    
    methods.handleIceCandidate = function(event) {
      console.log('icecandidate event: ', event);
      if (event.candidate) {
        room.data.sendMessage({
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      } else {
        console.log('End of candidates.');
      }
    }
    
    methods.handleCreateOfferError = function(event) {
      console.log('createOffer() error: ', event);
    }
    
    methods.doCall = function() {
      console.log('Sending offer to peer');
      pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }
    
    methods.doAnswer = function() {
      console.log('Sending answer to peer.');
      pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
      );
    }
    
    methods.setLocalAndSendMessage = function(sessionDescription) {
      pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      room.data.sendMessage(sessionDescription);
    }
    
    methods.onCreateSessionDescriptionError = function(error) {
      trace('Failed to create session description: ' + error.toString());
    }
    
    methods.requestTurn = function(turnURL) {
      var turnExists = false;
      for (var i in pcConfig.iceServers) {
        if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
          turnExists = true;
          turnReady = true;
          break;
        }
      }
      if (!turnExists) {
        console.log('Getting TURN server from ', turnURL);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            var turnServer = JSON.parse(xhr.responseText);
            console.log('Got TURN server: ', turnServer);
            pcConfig.iceServers.push({
              'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
              'credential': turnServer.password
            });
            turnReady = true;
          }
        };
        xhr.open('GET', turnURL, true);
        xhr.send();
      }
    }
    
    methods.handleRemoteStreamAdded = function(event) {
      console.log('Remote stream added.');
      remoteStream = event.stream;
      remoteVideo.srcObject = remoteStream;
    }
    
    methods.handleRemoteStreamRemoved = function(event) {
      console.log('Remote stream removed. Event: ', event);
    }
    
    methods.hangup = function() {
      console.log('Hanging up.');
      stop();
      sendMessage('bye');
    }
    
    methods.handleRemoteHangup = function() {
      console.log('Session terminated.');
      methods.stop();
      isInitiator = false;
    }
    
    methods.stop = function() {
      isStarted = false;
      pc.close();
      pc = null;
    }

  exports.data = methods;