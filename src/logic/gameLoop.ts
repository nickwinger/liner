import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {StateService} from "../services/stateService";
import {Direction} from "../model/enums";
import {Player, Color, Line} from "../model/player";
import {RootModel} from "../model/root";
import {MessageService} from "../services/messageService";
import {IVector} from "../model/interfaces";
import {LobbyManager} from "../services/lobbyManager";

@Injectable()
export class GameLoop {
  timer;
  private lobbyEventStartRef;
  private playerVectorsRef;

  constructor(protected state: StateService, protected rootModel: RootModel, protected messageService: MessageService,
            protected lobbyManager: LobbyManager) {
    rootModel.currentLobbyObservable.subscribe(() => {
      if (!this.rootModel.currentLobby)
        return;

      if (this.lobbyEventStartRef)
        this.lobbyEventStartRef.off('value');

      this.lobbyEventStartRef = firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/events/start');
      this.lobbyEventStartRef.on('value', (start) => {
        console.log('received START', start.val());
        if (start.val())
          this.start();
      });
    });
  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  get player(): Player { return this.state.player; }

  stop() {
    if (this.playerVectorsRef)
      this.playerVectorsRef.off('value');

    clearInterval(this.timer);
  }

  setPlayerDead(player: Player) {
    player.alive = false;
    this.lobbyManager.writeLn('Player ' + player.name + ' crashed', player.colorString);
  }

  isLineIntersect(x1,y1,x2,y2, x3,y3,x4,y4): boolean {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
      return false;
    } else {
      if (x1>=x2) {
        if (!(x2<=x&&x<=x1)) {return false;}
      } else {
        if (!(x1<=x&&x<=x2)) {return false;}
      }
      if (y1>=y2) {
        if (!(y2<=y&&y<=y1)) {return false;}
      } else {
        if (!(y1<=y&&y<=y2)) {return false;}
      }
      if (x3>=x4) {
        if (!(x4<=x&&x<=x3)) {return false;}
      } else {
        if (!(x3<=x&&x<=x4)) {return false;}
      }
      if (y3>=y4) {
        if (!(y4<=y&&y<=y3)) {return false;}
      } else {
        if (!(y3<=y&&y<=y4)) {return false;}
      }
    }
    return true;
  }

  lineIntersect(l1: Line, l2: Line): boolean {
    return this.isLineIntersect(l1.x1, l1.y1, l1.x2, l1.y2, l2.x1, l2.y1, l2.x2, l2.y2);
  }

  isCurrentPlayerLineIntersectingOther(): boolean {
    var currentPlayer = this.rootModel.currentGame.getPlayerById(this.user.uid);
    var ret = false;

    this.rootModel.currentGame.players.forEach((player) => {
      player.lines.forEach((line) => {
        if (this.lineIntersect(currentPlayer.currentLine, line))
          ret = true;
      });
    });

    return ret;
  }

  updateGame() {
    this.rootModel.currentGame.players.forEach((player) => {
      if (player.alive) {
        player.move();

        // Only check alive condition for ourselves
        if (player.id == this.user.uid) {
          if (player.pos.y <= 0 || player.pos.y >= this.state.rasterHeight || player.pos.x <= 0 || player.pos.x >= this.state.rasterWidth)
            this.setPlayerDead(player);

          if (this.isCurrentPlayerLineIntersectingOther())
            this.setPlayerDead(player);
        }


      }
    });
  }

  redrawFromSnapshot(snapshot: firebase.database.DataSnapshot) {
    snapshot.forEach((playerVectorsSnapshot: firebase.database.DataSnapshot) => {
      let player = this.rootModel.currentGame.getPlayerById(playerVectorsSnapshot.key);
      player.lines = [];
      let count = 0;
      let prevVector;

      playerVectorsSnapshot.forEach((vectorSnapshot: firebase.database.DataSnapshot) => {
        let vector = <IVector>vectorSnapshot.val();

        if (count == 0)
          prevVector = vector;
        else {
          player.lines.push(new Line(prevVector.x, prevVector.y, vector.x, vector.y));
          prevVector = vector;
        }

        count++;
        return false;
      });

      return false;
    });
  }

  updatePlayerPosFromSnapshot(snapshot: firebase.database.DataSnapshot) {
    snapshot.forEach((playerVectorsSnapshot: firebase.database.DataSnapshot) => {
      let player = this.rootModel.currentGame.getPlayerById(playerVectorsSnapshot.key);
      let count = 0;

      playerVectorsSnapshot.forEach((vectorSnapshot: firebase.database.DataSnapshot) => {
        let vector = <IVector>vectorSnapshot.val();
        if (count == playerVectorsSnapshot.numChildren() - 1) {
          player.setPos(vector.x, vector.y);
        }

        count++;
        return false;
      });

      return false;
    });
  }

  start() {
    /*
    this.playerVectorsRef = firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/vectors');
    this.playerVectorsRef.on('value', (snapshot: firebase.database.DataSnapshot) => {
      console.log('vectors changed', snapshot.val());
      this.redrawFromSnapshot(snapshot);
      this.updatePlayerPosFromSnapshot(snapshot);
    });*/

    this.playerVectorsRef = firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/lines');
    this.playerVectorsRef.on('child_added', (snapshot: firebase.database.DataSnapshot) => {
      var userVector = snapshot.val();

      console.log('vectors changed', snapshot.val());
      let player = this.rootModel.currentGame.getPlayerById(userVector.userId);
      player.lines.push(new Line(userVector.x1, userVector.y1, userVector.x2, userVector.y2));
      player.setPos(userVector.x2, userVector.y2);
      player.dir = userVector.dir;

      //this.redrawFromSnapshot(snapshot);
      //this.updatePlayerPosFromSnapshot(snapshot);
    });

    var gameFps = 10;

    var loops = 0, skipTicks = 1000 / gameFps,
      maxFrameSkip = 10,
      nextGameTick = (new Date).getTime();

    this.timer = setInterval(() => {

      loops = 0;

      while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
        this.updateGame();

        nextGameTick += skipTicks;
        loops++;
      }

    }, 0);



/*        var pixel = getPixel(player.x, player.y);
        if (pixel.r != 255 || pixel.g != 255 || pixel.b != 255)
          player.alive = false;*/

        //drawPlayer(player);


        /*if (!player.alive)
          printLn('Player dead');*/

//        firebase.database().ref('players/' + this.player.id).set(this.player);
        // firebase.database().ref('state').set(state);



  }
}
