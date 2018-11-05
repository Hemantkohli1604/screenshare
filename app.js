"use strict";
"use warnings";
const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {Menu}  = remote.require('electron')
const {desktopCapturer}  = require('electron')
var peer = require('./peer.js')
var share = require('./share.js')
var room = require('./room.js')
var localStream;
var pc;
var remoteStream;
let desktopSharing;

const mainMenuTemplate = [{label:'Electron',
        submenu: [{label: 'Share Screen',
          click: function (){
            ipc.send('toggle-pref')
            }
          }]
        }]

const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
Menu.setApplicationMenu(mainMenu);

var socket = io.connect('http://localhost:8080');

// Set up audio and video regardless of what devices are present.
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    console.log("Message Recieved got user media")
    share.data.maybeStart();
  } else if (message.type === 'offer') {
    if (!peer.data.isInitiator && !peer.data.isStarted) {
      share.data.maybeStart();
    }
    console.log(peer.data.pc)
    peer.data.pc.setRemoteDescription(new RTCSessionDescription(message));
    peer.data.doAnswer();
  } else if (message.type === 'answer' && peer.data.isStarted) {
    peer.data.pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && peer.data.isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    peer.data.pc.addIceCandidate(candidate);
  } else if (message === 'bye' && peer.data.isStarted) {
    peer.data.handleRemoteHangup();
  }
  });

 // var localVideo = document.querySelector('#local-video');
 // var remoteVideo = document.querySelector('#remote-video');
  window.onbeforeunload = function() {
    room.data.sendMessage('bye');
  };