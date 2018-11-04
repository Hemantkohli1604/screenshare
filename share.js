"use strict";
"use warnings";
const electron = require('electron');
var fxn = require('./view.js');
var room = require('./room.js');
var peer = require('./peer.js');
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
  
    methods.toggle = function(){
      if (!desktopSharing) {
        var id = ($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
        methods.onAccessApproved(id);
      } else {
        desktopSharing = false;
    
        if (localStream)
          localStream.getTracks()[0].stop();
          localStream = null;
        //document.getElementById('showPage3Btn').hide();
          document.getElementById('sharefinal').innerHTML = "Share Again";
    
        $('select').empty();
        fxn.data.showSources();
        fxn.data.refresh();
      }
      }
    
      methods.onAccessApproved = function(desktop_id) {
        if (!desktop_id) {
          console.log('Desktop Capture access rejected.');
          return;
        }
        desktopSharing = true;
        document.getElementById('sharefinal').innerHTML = "Stop Sharing";
        
        console.log("Desktop sharing started.. desktop_id:" + desktop_id);
        //notify();
        navigator.webkitGetUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: desktop_id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720
              }
          }
        }, gotStream, getUserMediaError);
      
        function gotStream(stream) {
          localStream = stream;
          //$('#local-video').srcObject = stream;
          //document.getElementById('local-video').src = URL.createObjectURL(stream);
          document.getElementById('local-video').srcObject = localStream;
          console.log("got stream")
        ///
          room.data.sendMessage('got user media');
          if (isInitiator) {
          methods.maybeStart();
          }
          stream.onended = function() {
            if (desktopSharing) {
              console.log("SHARE")
            } 
          };
          }
          function getUserMediaError(e) {
            console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
          } 
        }
      methods.maybeStart = function() {
      console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
      if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
        console.log('>>>>>> creating peer connection');
        peer.data.createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
          peer.data.doCall();
        }
      }
      }


  exports.data = methods;