import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {RootModel} from "../model/root";
import {Game} from "../model/game";
import {Player, Line} from "../model/player";
import {IVector} from "../model/interfaces";
import {Direction} from "../model/enums";

@Injectable()
export class GameManager {
  private lobbyGameRef: firebase.database.Reference;

  constructor(protected rootModel: RootModel) {

    rootModel.currentLobbyObservable.subscribe(() => {
      if (!this.rootModel.currentLobby)
        return;

      if (this.lobbyGameRef)
        this.lobbyGameRef.off('value');

      this.lobbyGameRef = firebase.database().ref('lobbies/' + rootModel.currentLobby.name + '/game');
      this.lobbyGameRef.on('value', (game) => {
        if (!game.exists())
          return;

        this.rootModel.currentGame = Game.fromJson(game.val());
        console.log('got game', this.rootModel.currentGame);
      });
    });
  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  get player(): Player { return this.rootModel.currentGame.getPlayerById(this.user.uid); }

  playerTurnRight() {
    if (!this.player.alive)
      return;
    let currentLine = this.player.currentLine;
    this.player.turnRight();
console.log('currentline', currentLine, this.player.pos);
    this.addLine(currentLine, this.player.dir);
    //this.addVector(this.player.vector);
  }

  playerTurnLeft() {
    if (!this.player.alive)
      return;

    let currentLine = this.player.currentLine;
    this.player.turnLeft();

    this.addLine(currentLine, this.player.dir);
    //this.addVector(this.player.vector);
  }

  random(min: number, max: number): number {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  addLine(line: Line, dir: Direction, userId?: string) {
    if (!userId)
      userId = this.user.uid;

    firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/lines').push({
      x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, dir: dir, userId: userId
    });
  }

  addVector(vector: IVector, userId?: string) {
    if (!userId)
      userId = this.user.uid;

    firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/vectors').push({
      x: vector.x, y: vector.y, dir: vector.dir, userId: userId
    });
  }

  newGame() {
    let game = new Game();

    // Delete any vectors in lobby
    firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/vectors').remove();

    firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/users').once('value', (snapshot) => {
      snapshot.forEach((userSnapshot) => {
        let user = userSnapshot.val();

        let player = new Player();
        player.name = user.name;
        player.id = user.uid;
        player.alive = true;
        player.setPos(this.random(50, this.rootModel.rasterSize.width - 50), this.random(50, this.rootModel.rasterSize.height - 50));
        player.dir = this.random(0, 3);
        //this.addVector(player.vector, user.uid);
        game.players.push(player);

        return false;
      });

      firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/game').set(game);
      setTimeout(() => {
        firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/events/start').set(true);
      }, 2000);
    });
  }
}
