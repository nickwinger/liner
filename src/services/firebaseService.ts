import {Injectable} from "@angular/core";

@Injectable()
export class FirebaseService {

  sendMessage(msg: string) {
    firebase.database().ref('message').set(msg);
  }

  sendState() {
    //firebase.database().ref('state').set(state);
  }

  loginGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log('singed in user ', user);

      firebase.database().ref('message').set('User ' + user.displayName + ' has joined.');
      /*player.id = user.uid;
      player.name = user.displayName;
      setPlayerToState();
      sendState();*/

      // ...
    }).catch(function (error) {
      console.log('login error', error);
    });
  }
}
/*
function getPixel(x, y)
{
  var p = ctx.getImageData(x, y, 1, 1).data;
  return {
    r: p[0], g: p[1], b: p[2]
  };

  //var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  //return hex;
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

var firstTime = true;
function updateState(newState) {
  console.log('state',newState);

  state = newState;

  var user = firebase.auth().currentUser;
  console.log('currentUser', user);
  //state.players[player.name] = player;

  if (firstTime) {
    firstTime = false;

    firebase.database().ref('state').set(state);
  }
}


function start() {
  var user = firebase.auth().currentUser;
  if (!user)
    return;

  ctx.fillStyle = "rgba(255,255,255,255)"; // "rgba("+r+","+g+","+b+","+(a/255)+")";
  ctx.fillRect(0, 0, rasterWidth, rasterHeight);

  sendMessage('Starting...');

  player.x = 100;
  player.y = 100;
  player.alive = true;
  setPlayerToState();
  sendState();
}

function keydown(event) {
  switch (event.keyCode) {
    case 38: // Up
      player.dir = UP;
      break;
    case 40:  // Down
      player.dir = DOWN;
      break;
    case 37:  // Left
      player.dir = LEFT;
      break;
    case 39:  // Right
      player.dir = RIGHT;
      break;
  }
}

timer = setInterval(function() {
  if (player.alive) {
    switch (player.dir) {
      case UP: player.y--; break;
      case DOWN: player.y++; break;
      case LEFT: player.x--; break;
      case RIGHT: player.x++; break;
    }

    var pixel = getPixel(player.x, player.y);
    if (pixel.r != 255 || pixel.g != 255 || pixel.b != 255)
      player.alive = false;

    //drawPlayer(player);

    if (player.y <= 0 || player.y >= rasterHeight || player.x <= 0 || player.x >= rasterWidth)
      player.alive = false;

    if (!player.alive)
      printLn('Player dead');

    firebase.database().ref('players/' + player.id).set(player);
    // firebase.database().ref('state').set(state);
  }


}, 100);*/
