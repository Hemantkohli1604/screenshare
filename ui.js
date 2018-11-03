const {desktopCapturer}  = require('electron')

$(document).ready(function (e) {
    $('button#sharescreen').hide();
    $('button#joinsession').hide();
    $('button#sharefinal').hide();

    showSources();
    refresh();
    
    function showView(viewName) {
        $('.view').hide();
        $('#' + viewName).show();      
    }
  
  $('[data-launch-view]').click(function (e) {
    e.preventDefault();
    var viewName = $(this).attr('data-launch-view');
    console.log(viewName)
      if (viewName === 'page2'){
        $('button#sharescreen').hide();
        $('button#joinsession').hide();
        $('button#sharefinal').show(); 
          //toggle();
        showView(viewName);
      } 
        showView(viewName);
  });
  });

  // Form Element  
  //Refresh the images
  function refresh() {
    $('select').imagepicker({
      hide_select : true
    });
  }

  //add local video source thumbnails
    function addSource(source) {
    $('select').append($('<option>', {
      value: source.id.replace(":", ""),
      text: source.name
    }));
    $('select option[value="' + source.id.replace(":", "") + '"]').attr('data-img-src', source.thumbnail.toDataURL());
    refresh();
    }

    //Show all video sources
    function showSources() {
        desktopCapturer.getSources({ types:['window', 'screen'] }, function(error, sources) {
          for (let source of sources) {
            $('thumbnail').append( " <p> Electron <p>"  );
            console.log("Name: " + source.name);
            addSource(source);
          }     
        });
      }

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
   //createRoom(roomName);
    $('button#sharescreen').show();
  } else {
    //getMedia(roomName);
    $('button#sharefinal').show();
  }
  return false;
});