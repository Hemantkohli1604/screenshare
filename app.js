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

function getElementCSSSize(el) {
  var cs = getComputedStyle(el);
  var w = parseInt(cs.getPropertyValue("width"), 10);
  var h = parseInt(cs.getPropertyValue("height"), 10);
  return {width: w, height: h}
}

function mouseHandler(event) {
  console.log('In Move')
  var size = getElementCSSSize(this);
  var scaleX = this.videoWidth / size.width;
  var scaleY = this.videoHeight / size.height;
  console.log(scaleX)

  var rect = this.getBoundingClientRect();  // absolute position of element
  var x = ((event.clientX - rect.left) * scaleX + 0.5)|0;
  var y = ((event.clientY - rect.top ) * scaleY + 0.5)|0;

 sendMessage ({type: 'mousemove', 'message': { x, y}},)
 //socket.emit('mousemove', {id: event.target,'message': {x,y}}); 
 //sendMessage({type: 'mousemove',  {'X': x  'Y': y }); 
  console.log ("x:" + x )
  console.log ("y" + y)
  //info.innerHTML = "x: " + x + " y: " + y;
  //initial.innerHTML = "(video: " + this.videoWidth + " x " + this.videoHeight + ")";
}

remoteVideo.addEventListener("mousemove", mouseHandler);

socket.on('mousemove', function (data) {
    	console.log( "receives" + data)
	});
