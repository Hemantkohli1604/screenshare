const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const {Menu}  = remote.require('electron')
const {desktopCapturer}  = require('electron')
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

