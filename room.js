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

var socket = io.connect('http://172.16.2.133:8080');

let desktopSharing;
var methods = {}; 
    methods.createRoom = function(room){
    isInitiator = true;
    methods.getMedia(room,isInitiator)
    }


    methods.getMedia = function(room,isInitiator){
    if (room !== '') {
    socket.emit('create or join', room);
    console.log('Attempted to create or  join room', room);
    }
  
    socket.on('created', function(room) {
    console.log('Created room ' + room);
    isInitiator = true;
    });
  
    socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
    });
  
  
    socket.on('join', function (room){
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
    });
  
    socket.on('joined', function(room) {
    console.log('joined: ' + room);
    isChannelReady = true;
    });
  
    socket.on('log', function(array) {
    console.log.apply(console, array);
    });
  
    }  
  // This client receives a message
    methods.sendMessage = function(message) {
    console.log('Client sending message: ', message);
    socket.emit('message', message);
    }

      exports.data = methods;