const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {Menu}  = remote.require('electron')
const {desktopCapturer}  = require('electron')
var peer = require('./peer.js')
var share = require('./share.js')
var room = require('./room.js')
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
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

var socket = io.connect('http://172.16.2.133:8080');

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    share.data.maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      share.data.maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    peer.data.doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    peer.data.handleRemoteHangup();
  }
  });

 // var localVideo = document.querySelector('#local-video');
 // var remoteVideo = document.querySelector('#remote-video');

  window.onbeforeunload = function() {
    room.data.sendMessage('bye');
  };