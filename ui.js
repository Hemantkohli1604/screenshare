var fxn = require('./function.js');
var room = require('./room.js')
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
  username = $('#username').val();
  const roomName = $('#roomName').val().toLowerCase();
  if (event.target.id === 'create-btn') {
   room.data.createRoom(roomName);
    $('button#sharescreen').show();
  } else {
    //getMedia(roomName);
    $('button#sharefinal').show();
  }
  return false;
});