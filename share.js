"use strict";
"use warnings";
const electron = require('electron');
var fxn = require('./view.js');
var room = require('./room.js');
var peer = require('./peer.js');
const {remote} = electron
const ipc = electron.ipcRenderer
const {desktopCapturer}  = require('electron')
var localStream;
var remoteStream;


let desktopSharing;
var methods = {}; 
  
    methods.toggle = function(){
      if (!desktopSharing) {
        var id = ($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
        onAccessApproved(id);
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
    
      function onAccessApproved(desktop_id) {
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
          
          if (peer.data.isInitiator) {
            console.log("isInitiator")
          peer.data.isChannelReady = true;
          //methods.maybeStart();
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
      console.log('>>>>>>> maybeStart() ', peer.data.isStarted, localStream, peer.data.isChannelReady);
      if (!peer.data.isStarted && typeof localStream !== 'undefined' && peer.data.isChannelReady) {
        console.log('>>>>>> creating peer connection');
        peer.data.createPeerConnection();
        console.log("share:" + peer.data.pc)
        peer.data.pc.addStream(localStream);
        peer.data.isStarted = true;
        console.log('isInitiator', peer.data.isInitiator);
        if (peer.data.isInitiator) {
          peer.data.doCall();
        }
      }
      }


  exports.data = methods;