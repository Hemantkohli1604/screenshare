"use strict";
"use warnings";
const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {desktopCapturer}  = require('electron')
var peer = require('./peer.js')
var localStream;
var pc;
var remoteStream;

var socket = io.connect('http://localhost:8080');

let desktopSharing;
var methods = {}; 
  methods.createRoom = function(room){
    console.log("room")
  peer.data.isInitiator = true;
  methods.getMedia(room,peer.data.isInitiator)
  }

  methods.getMedia = function(room,isInitiator){
    if (room !== '') {
    socket.emit('create or join', room);
    console.log('Attempted to create or  join room', room);
    }
  
    socket.on('created', function(room) {
    console.log('Created room ' + room);
    peer.data.isInitiator = true;
    });
  
    socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
    });
  
  
    socket.on('join', function (room){
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    peer.data.isChannelReady = true;
    });
  
    socket.on('joined', function(room) {
    console.log('joined: ' + room);
    peer.data.isChannelReady = true;
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