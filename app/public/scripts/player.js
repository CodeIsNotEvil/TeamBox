// functions for player & controls


let fsVideo = "";
let timeoutMove = 0;
let timeoutClick = 0;
let preventClick = false;


// FUNCTION to create controls
function createControls(area) {
  var videoName = area.className.split(" ")[0];
  area.innerHTML +=
    '<div id="playOverlay" class="' + videoName + ' control overlay active"></div>' +
    '<div id="controlsBar" class="' + videoName + ' controlsBar">' +
    '<div id="playPause" class="' + videoName + ' control play">' +
    '<img src="styles/media/video/play.png" id="imgPlay" class="' + videoName + ' button play active">' +
    '<img src="styles/media/video/pause.png" id="imgPause" class="' + videoName + ' button play inactive">' +
    '</div>' +
    '<input type="range" id="seekBar" class="' + videoName + ' control seek" value="0" name="seekBar-' + videoName + '">' +
    '<output id="seekOutput" class="' + videoName + ' output seek" for="seekBar-' + videoName + '" name="seekOutput-' + videoName + '">00:00</output>' +
    '<div id="fullScreen" class="' + videoName + ' control full">' +
    '<img src="styles/media/video/fullscreen.png" id="imgFullOn" class="' + videoName + ' button full active">' +
    '<img src="styles/media/video/minimize.png" id="imgFullOff" class="' + videoName + ' button full inactive">' +
    '</div>' +
    '<div id="subtitles" class="' + videoName + ' control subt">' +
    '<img src="styles/media/video/subtitles.png" id="imgSubt" class="' + videoName + ' button subt active">' +
    '</div>' +
    '<input type="range" id="volumeBar" class="' + videoName + ' control volume" min="0" max="1" step="0.1" value="0.7">' +
    '<div id="mute" class="' + videoName + ' control mute">' +
    '<img src="styles/media/video/mute.png" id="imgMute" class="' + videoName + ' button mute inactive">' +
    '<img src="styles/media/video/sound.png" id="imgSound" class="' + videoName + ' button mute active">' +
    '</div>' +
    '</div>' +
    '<div id="subtitlesMenu" class="' + videoName + ' subtitlesMenu"></div>';
  createSubtMenu(videoName);
}


// FUNCTION to create subtitle menus
function createSubtMenu(videoName) {
  var tracks = document.getElementsByClassName(videoName + " subtitle");
  var menu = document.getElementsByClassName(videoName + " subtitlesMenu")[0];
  for (var j = 0; j < tracks.length; j++) {
    var track = tracks[j];
    track.mode = "hidden";
    var subtButton = document.createElement("div");
    subtButton.innerHTML = track.label;
    subtButton.className = videoName + " subtitleButton " + track.srclang + " " + (track.default == true ? "active" : "inactive");
    menu.appendChild(subtButton);
    subtButton.addEventListener("click", subtitlesChange);
  }
  subtButton = document.createElement("div");
  subtButton.innerHTML = "Off";
  subtButton.className = videoName + " subtitleButton off inactive";
  menu.appendChild(subtButton);
  subtButton.addEventListener("click", subtitlesChange);
}



// -------------------------------------------------------------------------------------------------------------------------------------------------



// FUNCTION to show/hide controls
function showControls(hover) {
  if ((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) != true) {
    var videoName = hover.target.className.split(" ")[0];
    var video = document.getElementById(videoName);
    var controlsBar = document.getElementsByClassName(video.id + " controlsBar")[0];
    if (controlsBar.style.display == "none") {
      controlsBar.style.display = "block";
    }
  }
}
function hideControls(hover) {
  //if((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen)!=true){
  var videoName = hover.target.className.split(" ")[0];
  var video = document.getElementById(videoName);
  var controlsBar = document.getElementsByClassName(videoName + " controlsBar")[0];
  var subtMenu = document.getElementsByClassName(videoName + " subtitlesMenu")[0];
  if (!video.paused) {
    if (controlsBar.style.display != "none") {
      controlsBar.style.display = "none";
      subtMenu.style.display = "none";
    }
  }
  //}
}
function hideControlsFSMove(move) {
  if ((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) == true) {
    var videoName = move.target.className.split(" ")[0];
    var video = document.getElementById(videoName);
    var overlay = document.getElementsByClassName(videoName + " overlay")[0];
    var controlsBar = document.getElementsByClassName(videoName + " controlsBar")[0];
    if (video.paused == false) {
      clearTimeout(timeoutMove);
      if (move.target.className.split(" ")[0] == videoName) {
        clearTimeout(timeoutMove);
        if (controlsBar.style.display == "none") {
          controlsBar.style.display = "block";
        }
        timeoutMove = setTimeout(function () {
          if (move.target == overlay) {
            if (controlsBar.style.display != "none") {
              var subtMenu = document.getElementsByClassName(video.id + " subtitlesMenu")[0];
              controlsBar.style.display = "none";
              subtMenu.style.display = "none";
            }
          }
          clearTimeout(timeoutMove);
        }, 5000);
      }
      else {
        console.log(move.target);
      }
    }
  }
  // lastMove=move;
}
function hideControlsFSClick(click) {
  var video = document.getElementById(fsVideo);
  if (video.paused == false) {
    timeoutMove = setTimeout(function () {
      if ((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) == true) {
        var controlsBar = document.getElementsByClassName(video.id + " controlsBar")[0];
        if (controlsBar.style.display != "none") {
          var subtMenu = document.getElementsByClassName(video.id + " subtitlesMenu")[0];
          controlsBar.style.display = "none";
          subtMenu.style.display = "none";
        }
      }
      clearTimeout(timeoutMove);
    }, 5000);
  }
}

// FUNCTION to show/hide subtitle menu
function showSubtMenu(click) {
  var subtButton = click.target;
  var classes = subtButton.className.split(" ");
  var video = document.getElementById(classes[0]);
  var subtitlesMenu = document.getElementsByClassName(video.id + " subtitlesMenu")[0];
  if (subtitlesMenu.style.display == "block") {
    subtitlesMenu.style.display = "none";
  }
  else {
    subtitlesMenu.style.display = "block";
  }
}

// FUNCTION to detect fullscreen events
function detectFullscreen() {
  if (fsVideo != "") {
    buttonSwitch(fsVideo, "button full");
    var controlsBar = document.getElementsByClassName(fsVideo + " controlsBar")[0];
    var subtMenu = document.getElementsByClassName(fsVideo + " subtitlesMenu")[0];
    if (subtMenu.style.display != "none") {
      subtMenu.style.display = "none";
    }
    if (controlsBar.style.display == "none") {
      controlsBar.style.display = "block";
    }
    seek = document.getElementsByClassName(fsVideo + " control seek")[0];
    if ((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) == true) {
      var nextCtrl = document.getElementsByClassName(fsVideo + " control mute")[0];
      var width = nextCtrl.getBoundingClientRect().left - seek.getBoundingClientRect().left - 10;
      seek.style.width = width + "px";
    }
    else {
      seek.style.width = "369px";
    }
  }
}


// -------------------------------------------------------------------------------------------------------------------------


// FUNCTION to play/pause video
function play(click) {
  var videoName = click.target.className.split(" ")[0];
  var video = document.getElementById(videoName);
  if (video.paused == true) {
    video.play();
  }
  // this does not work for clicks, cause double click pauses by default
  else {
    video.pause();
  }
  buttonSwitch(video.id, "button play");
  buttonSwitch(video.id, "overlay");
}

// FUNCTION to set video time
function seek(click) {
  var seekBar = click.target;
  var videoName = seekBar.className.split(" ")[0];
  var video = document.getElementById(videoName);
  var output = document.getElementsByClassName(videoName + " output seek")[0];
  var time = video.duration * (seekBar.value / 100);
  video.currentTime = time;
  output.value = toTimeString(parseInt(time));
}
// FUNCTION to aupdate de videos seek bar
function updateSeekBar(evt) {
  var video = evt.target;
  var seekBar = document.getElementsByClassName(video.id + " control seek")[0];
  var value = (100 / video.duration) * video.currentTime;
  // change play button when finished
  if (video.currentTime == video.duration) {
    buttonSwitch(video.id, "button play");
    video.currentTime = 0;
    seekBar.value = 0;
  }
  else {
    seekBar.value = value;
  }
}
// FUNCTION to edit seek's time bubble
function editSeekOutput(hover) {
  var videoName = hover.target.className.split(" ")[0];
  var video = document.getElementById(videoName);
  var seekBar = document.getElementsByClassName(videoName + " control seek")[0];
  var output = document.getElementsByClassName(videoName + " output seek")[0];
  if (output.style.display != "block") {
    output.style.display = "block";
  }
  var position = hover.screenX - seekBar.getBoundingClientRect().left - (output.style.width / 2);
  var value = position / (seekBar.getBoundingClientRect().right - seekBar.getBoundingClientRect().left);
  output.style.marginLeft = position + "px";
  var time = video.duration * value;
  output.value = toTimeString(parseInt(time));
}

//FUNCTION to mute sound
function mute(click) {
  var muteButton = click.target;
  var classes = muteButton.className.split(" ");
  var video = document.getElementById(classes[0]);
  if (video.muted == false) {
    video.muted = true;
    //let tempVolume=0;
  }
  else {
    video.muted = false;
    //let tempVolume=volume[video.id];
  }
  document.getElementsByClassName(video.id + " control volume")[0].value = tempVolume;
  buttonSwitch(video.id, "button mute")
}

// FUNCTION to adjust volume
function volume(click) {
  var valumeBar = click.target;
  var classes = valumeBar.className.split(" ");
  var video = document.getElementById(classes[0]);
  if (volumeBar.value == 0) {
    if (video.muted == false) {
      video.muted = true;
      buttonSwitch(video.id, "button mute");
    }
  }
  else {
    if (video.muted == true) {
      video.muted = false;
      buttonSwitch(video.id, "button mute");
    }
  }

  video.volume = volumeBar.value;
  volume[video.id] = volumeBar.value;
}

// FUNCTION for subtitles switch
function subtitlesChange(click) {
  var subtitle = click.target;
  var classes = subtitle.className.split(" ");
  var video = document.getElementById(classes[0]);
  var lang = classes[2];
  var subtButtons = document.getElementsByClassName(video.id + " subtitleButton");
  for (var i = 0; i < subtButtons.length; i++) {
    let button = subtButtons[i];
    if (button == subtitle) {
      button.className = button.className.substring(0, button.className.lastIndexOf(" ")) + " active";
    }
    else {
      button.className = button.className.substring(0, button.className.lastIndexOf(" ")) + " inactive";
    }
  }
  var tracks = video.textTracks;
  for (var track_inc = 0; track_inc < tracks.length; track_inc++) {
    var track = tracks[track_inc];
    if (track.language == lang) {
      track.mode = "showing";
    }
    else {
      track.mode = "hidden";
    }
  }
}

// FUNCTION for full screen switch
function fullscreen(click) {
  fullscreen = click.target;
  var classes = fullscreen.className.split(" ");
  var video = document.getElementById(classes[0]);
  var tutorial = document.getElementsByClassName(video.id + " tutorialArea")[0];
  //var subtMenu=document.getElementsByClassName(video.id+" subtitlesMenu")[0];
  //var controls=document.getElementsByClassName(video.id+" controlsBar")[0];
  if ((document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) == true) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullscreen) {
      document.webkitCancelFullscreen();
    }
  }
  else {
    fsVideo = video.id;
    if (tutorial.requestFullscreen) {
      tutorial.requestFullscreen();
      //  video.requestFullscreen();
    }
    else if (tutorial.mozRequestFullScreen) {
      tutorial.mozRequestFullScreen();
      //  video.mozRequestFullScreen(); // Firefox
    }
    else if (tutorial.webkitRequestFullscreen) {
      tutorial.webkitRequestFullscreen();
      //  video.webkitRequestFullscreen(); // Chrome and Safari
    }
  }
}

// FUNCTION to switch buttons
function buttonSwitch(videoName, controlName) {
  console.log("switch: " + controlName)
  var buttonInactive = document.getElementsByClassName(videoName + " " + controlName + " inactive")[0];
  var buttonActive = document.getElementsByClassName(videoName + " " + controlName + " active")[0];
  if (buttonInactive != null) {
    buttonInactive.className = videoName + " " + controlName + " active";
  }
  if (buttonActive != null) {
    buttonActive.className = videoName + " " + controlName + " inactive";
  }
}


// FUNCTION to get formatted time string
function toTimeString(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  seconds = seconds - (hours * 3600) - (minutes * 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (hours == 0) {
    // hours   = "0"+hours;
    return minutes + ':' + seconds;
  }
  else if (hours < 10) {
    hours = "0" + hours;
  }
  return hours + ':' + minutes + ':' + seconds;
}
