"use strict";
"use warnings";
const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {desktopCapturer}  = require('electron')
var room = require('./room.js');

var localStream;
var remoteStream;

let desktopSharing;
var methods = {}; 

var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

 var localVideo = document.querySelector('#local-video');
 var remoteVideo = document.querySelector('#remote-video');

 methods.isChannelReady = false;
 methods.isInitiator = false;
 methods.isStarted = false;
 methods.pc = false;
    methods.createPeerConnection = function(Started) {
      try {
        methods.pc = new RTCPeerConnection(null);
        methods.pc.onicecandidate = handleIceCandidate;
        methods.pc.onaddstream = handleRemoteStreamAdded;
        methods.pc.onremovestream = handleRemoteStreamRemoved;
        
        console.log('Created RTCPeerConnnection');
      } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
      }
    }
    
    function handleIceCandidate(event) {
      console.log("in ice")
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
    
    function handleCreateOfferError(event) {
      console.log('createOffer() error: ', event);
    }
    
    methods.doCall = function() {
      console.log('Sending offer to peer');
      methods.pc.createOffer(setLocalAndSendMessage,handleCreateOfferError);
    }
    
    methods.doAnswer = function() {
      console.log('Sending answer to peer.');
      console.log(methods.pc)
      methods.pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
      );
    }
    
    function setLocalAndSendMessage(sessionDescription) {
      methods.pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      room.data.sendMessage(sessionDescription);
    }
    
    function onCreateSessionDescriptionError(error) {
      console.log('Failed to create session description: ' + error.toString());
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
    
    function handleRemoteStreamAdded(event) {
      console.log('Remote stream added.');
      remoteStream = event.stream;
      remoteVideo.srcObject = remoteStream;
    }
    
    function handleRemoteStreamRemoved(event) {
      console.log('Remote stream removed. Event: ', event);
    }
    
    methods.hangup = function() {
      console.log('Hanging up.');
      stop();
      sendMessage('bye');
    }
    
    methods.handleRemoteHangup = function() {
      console.log('Session terminated.');
      stop();
      methods.isInitiator = false;
    }
    
    function stop() {
      methods.isStarted = false;
      methods.pc.close();
      methods.pc = null;
    }

  exports.data = methods;