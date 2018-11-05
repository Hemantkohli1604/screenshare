"use strict";
"use warnings";
var fxn = require('./view.js');
var room = require('./room.js');
var share = require('./share.js');
var peer = require('./peer.js');
const {desktopCapturer}  = require('electron')

$(document).ready(function (e) {
    $('button#sharescreen').hide();
    $('button#joinsession').hide();
    $('button#sharefinal').hide();

    fxn.data.showSources();
    fxn.data.refresh();

  $('[data-launch-view]').click(function (e) {
    e.preventDefault();
    var viewName = $(this).attr('data-launch-view');
    console.log(viewName)
      if (viewName === 'page2'){
        $('button#sharescreen').hide();
        $('button#joinsession').hide();
        $('button#sharefinal').show(); 
          //toggle();
        fxn.data.showView(viewName);
      } 
        fxn.data.showView(viewName);
  });
  });
      //form related stuff
const formEl = $('.form');
formEl.form({
  fields: {
    roomName: 'empty',
    username: 'empty',
  },
});

$('.submit').on('click', (event) => {
  if (!formEl.form('is valid')) {
    return false;
  }
  const username = $('#username').val();
  const roomName = $('#roomName').val().toLowerCase();
  if (event.target.id === 'create-btn') {
   room.data.createRoom(roomName);
    $('button#sharescreen').show();
  } else {
    room.data.getMedia(roomName);
    $('button#joinsession').show();
  }
  return false;
});

document.getElementById('sharefinal').addEventListener('click', function(e) {
  share.data.toggle(); 
});

document.getElementById('joinsession').addEventListener('click', function(e) {
  console.log('>>>>>> creating peer connection'); 
    peer.data.createPeerConnection();
    peer.data.isStarted = true;    
});