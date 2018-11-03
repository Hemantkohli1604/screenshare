const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {desktopCapturer}  = require('electron')
var source;
var methods = {};
    methods.showView = function(viewName) {
    $('.view').hide();
    $('#' + viewName).show();      
    };
  
    methods.refresh = function() {
    console.log("working")
    $('select').imagepicker({
      hide_select : true
    });
    };

  //add local video source thumbnails
    methods.addSource = function(source) {
    $('select').append($('<option>', {
      value: source.id.replace(":", ""),
      text: source.name
    }));
    $('select option[value="' + source.id.replace(":", "") + '"]').attr('data-img-src', source.thumbnail.toDataURL());
    methods.refresh();
    };

    //Show all video sources
    methods.showSources = function(){
        desktopCapturer.getSources({ types:['window', 'screen'] }, function(error, sources) {
          for (let source of sources) {
            $('thumbnail').append( " <p> Electron <p>"  );
            console.log("Name: " + source.name);
            methods.addSource(source);
          }     
        });
      }

      exports.data = methods;