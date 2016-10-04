/*
*Author - Chethan Ningaraju
*/

window.addEventListener('load', function() {
  //hbbtvlib_initialize();
  //hbbtvlib_show();
});
window.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 40:
      e.preventDefault();
      if (userStartGame == 0) {
        myGameArea.interval = setInterval(updateGameArea, UpdateInterval);
        backgroundSound.play();
        userStartGame = 1;
      } else {
        document.getElementById('output').innerHTML = 'Red Key';
        myGamePiece.y += Math.round(20 * scale_factor);
        break;
      }
    case 38:
      e.preventDefault();
      document.getElementById('output').innerHTML = 'Yellow Key';
      myGamePiece.y -= Math.round(20 * scale_factor);
      myGamePiece.myimage = rocket_on;
      myGameArea.lastBottonFrame = myGameArea.frameNo
      break;
    case 27:
      e.preventDefault();
      hbbtvlib_init_broadcast('video-container', 'video');
      break;
  }
}, false);

var myGamePiece;
var myObstacles = [];
var myScore;
var gameBackground;
var backgroundSound;
var userStartGame = 0;

// two images for fire animation
var fireIm_1 = new image_component("./images/fire_5.png");
var fireIm_2 = new image_component("./images/fire_6.png");
var rocket_off = new image_component("./images/rocket_off_scaled.png");
var rocket_on = new image_component("./images/rocket_on_scaled.png");
var gameBackGroundImage = new image_component("./images/sky_background.jpg");
//back gound sound
var musicBG = "./sounds/TheForestAwakes.mp3"

//Game Parameters
var scale_factor = 1.6;// Everything pixel related should be scaled with this
var dispX = Math.round(480 * scale_factor), dispY = Math.round(270 * scale_factor);
var pieceWidth = Math.round(30 * scale_factor), pieceHeight = Math.round(30 * scale_factor);
var minGap = pieceHeight + Math.round(20 * scale_factor), maxGap = dispY * 0.8;

// FPS
var UpdateInterval = 20;
var pixChangePerFrame = Math.round(Math.round(UpdateInterval / 20 * scale_factor));
function startGame() {
  console.log('check2');
  myGameArea.start();
  gameBackground = new component(dispX, dispY, gameBackGroundImage, 0, 0, "image", "background");
  myGamePiece = new component(pieceWidth, pieceHeight, rocket_off, Math.round(10 * scale_factor), Math.round(120 * scale_factor), "image", "piece");
  myScore = new component("15px", "Consolas", "red", Math.round(380 * scale_factor), Math.round(40 * scale_factor), "text");
  backgroundSound = new sound(musicBG);
}
/**
 * @constructor
 */
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  }
  this.stop = function() {
    this.sound.pause();
  }
}
/**
 * @constructor
 * @param {string} src
 */
function image_component(source) {
  this.image = new Image();
  this.image.src = source;
  this.isLoaded = false;
  this.image.onload = function() {
    this.isLoaded = true;
  };
}
/**
 * @constructor
 * @param {number|string} width
 * @param {string} height
 */
function component(width, height, color, x, y, type, imType) {
  this.type = type;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.color = color;
  if (this.type == "image") {
    this.myimage = color;
    this.imType = imType;
  }
}
component.prototype.update = function() {
  ctx = myGameArea.context;
  if (this.type == "text") {
    ctx.font = this.width + " " + this.height;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
  }
  else if (this.type == "image") {
    if (this.imType == "background") {
      var cur_scroll_start = (this.x + Math.floor((myGameArea.frameNo + 1) / 2)) % this.myimage.image.width;
      //window.alert(this.myimage.isLoaded);
      ctx.drawImage(this.myimage.image, cur_scroll_start, this.y, this.width, this.myimage.image.height, this.x, this.y, this.width, this.height);
    }
    else {
      ctx.drawImage(this.myimage.image, this.x, this.y, this.width, this.height);
    }
    //check if the image is rocket on, It should be on only for some duration
    if (this.imType == "piece" && myGameArea.lastBottonFrame != -1 && (myGameArea.frameNo - myGameArea.lastBottonFrame) > 10) {
      this.myimage = rocket_off;
      myGameArea.lastBottonFrame = -1;
    } else if (this.imType == "obstacle") {
      if (myGameArea.frameNo != 1 && everyinterval(UpdateInterval / 2)) {
        if (this.myimage == fireIm_1) {
          this.myimage = fireIm_2;
        } else {
          this.myimage = fireIm_1;
        }
      }
    }
    else if (this.imType == "backgound") {

    }
  }
  else {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};
component.prototype.crashWith = function(otherobj) {
  var myleft = this.x;
  var myright = this.x + (this.width);
  var mytop = this.y;
  var mybottom = this.y + (this.height);
  var otherleft = otherobj.x;
  var otherright = otherobj.x + (otherobj.width);
  var othertop = otherobj.y;
  var otherbottom = otherobj.y + (otherobj.height);
  var crash = true;
  if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
    crash = false;
  }
  return crash;
};
function updateGamePiece() {
  if (myGamePiece.y >= myGameArea.canvas.height - myGamePiece.height) {
    myGamePiece.y = myGameArea.canvas.height - myGamePiece.height;
  }
  else {
    myGamePiece.y += pixChangePerFrame;
  }
}
function updateGameArea() {
  var x, height, gap, minHeight, maxHeight;;
  for (i = 0; i < myObstacles.length; i += 1) {
    if (myGamePiece.crashWith(myObstacles[i])) {
      myGameArea.stop();
      return;
    }
  }
  myGameArea.clear();
  myGameArea.frameNo += 1;
  if (myGameArea.frameNo == 1 || everyinterval(150)) {
    x = myGameArea.canvas.width;//this will make sure it forms at other end of frame
    minHeight = Math.round(20 * scale_factor);
    maxHeight = Math.round(200 * scale_factor);
    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

    y = myGameArea.canvas.height - Math.round(200 * scale_factor);
    myObstacles.push(new component(Math.round(20 * scale_factor), height, fireIm_1, x, 0, "image", "obstacle"));
    myObstacles.push(new component(Math.round(20 * scale_factor), x - height - gap, fireIm_1, x, height + gap, "image", "obstacle"));
  }
  // Order is important here, based on this elements will be overwritten
  gameBackground.update();
  for (i = 0; i < myObstacles.length; i += 1) {
    myObstacles[i].x -= Math.round(1 * scale_factor);
    myObstacles[i].update();
  }
  // Write new score as frame number
  myScore.text = "SCORE:" + Math.round(myGameArea.frameNo / 10);
  myScore.update();
  updateGamePiece();
  myGamePiece.update();
}
var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function() {
    this.canvas.width = dispX;
    this.canvas.height = dispY;

    this.canvas.style.zIndex = 8;
    this.canvas.style.position = "absolute";
    this.canvas.style.border = "1px solid";
    div = document.getElementById("save-area");
    this.context = this.canvas.getContext("2d");
    //document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    div.appendChild(this.canvas)
    this.frameNo = 0;
    this.lastBottonFrame = -1;

    /**
     * Startup screen
     */
    var gameBackground1 = new Image();
    gameBackground1.src = "./images/start_background.jpg";
    var startMessage1 = new component("40px", "Impact", "cyan", Math.round(200 * scale_factor), Math.round(120 * scale_factor), "text");
    startMessage1.text = "X-SPACE";

    var startMessage2 = new component("20px", "Impact", "yellow", Math.round(200 * scale_factor), Math.round(140 * scale_factor), "text");
    startMessage2.text = "Use Up & Down arrows to play";

    gameBackground1.onload = function() {
      myGameArea.context.drawImage(gameBackground1, 0, 0, dispX, dispY);
      startMessage1.update();
      startMessage2.update();
    };
    //End of start up screen

  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function() {
    // Display gameover message before restarting the game
    var stopMessage = new component("30px", "Consolas", "red", Math.round(200 * scale_factor), Math.round(120 * scale_factor), "text");
    stopMessage.text = "GAME OVER";
    stopMessage.update();
    var stopMessage_2 = new component("30px", "Consolas", "red", Math.round(210 * scale_factor), Math.round(150 * scale_factor), "text");
    stopMessage_2.text = "SCORE:" + Math.round(myGameArea.frameNo / 10);
    stopMessage_2.update();
    clearInterval(this.interval);
    setTimeout(function() {
      window.location.href = window.location.href.split('?')[0] + "?t=" + (new Date().getTime());
    }, 5000)

  }
}
function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
  return false;
}

setTimeout(function() {
  //delay for images to pre-load
}, 1000)
startGame();