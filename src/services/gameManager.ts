import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {RootModel} from "../model/root";
import {Game} from "../model/game";
import {Player, Line} from "../model/player";
import {IVector} from "../model/interfaces";
import {Direction, Colors} from "../model/enums";
import {LobbyManager} from "./lobbyManager";
import {LobbiesRepository} from "./lobbiesRepository";

@Injectable()
export class GameManager {
  private lobbyGameRef: firebase.database.Reference;

  constructor(protected rootModel: RootModel, protected lobbyManager: LobbyManager, protected lobbiesRepository: LobbiesRepository) {

    rootModel.currentLobbyObservable.subscribe(() => {
      if (!this.rootModel.currentLobby)
        return;

      if (this.lobbyGameRef)
        this.lobbyGameRef.off('value');

      this.lobbyGameRef = lobbiesRepository.ref('game');
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

    let currentLine = this.player.currentLine.clone();
    currentLine.dir = this.player.dir;
    this.player.turnRight();

    this.addLine(currentLine, this.player.dir);
    //this.addVector(this.player.vector);
  }

  playerTurnLeft() {
    if (!this.player.alive)
      return;

    let currentLine = this.player.currentLine.clone();
    currentLine.dir = this.player.dir;
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

    this.lobbiesRepository.push('lines', {
      line: line, dir: dir, userId: userId
    });
  }

  newGame(fps: number) {
    let game = new Game();
    game.fps = fps;

    // Delete any vectors in lobby
    console.log('cleaning up vectors from lobby');
    this.lobbiesRepository.remove('lines');

    this.lobbiesRepository.once('users', 'value', (snapshot) => {
      snapshot.forEach((userSnapshot) => {
        let user = userSnapshot.val();

        let abstand = 20;
        let player = new Player();
        player.name = user.name;
        player.id = user.uid;
        player.color = Colors[user.colorId];
        player.alive = true;
        player.setPos(this.random(abstand, this.rootModel.rasterSize.width - abstand), this.random(abstand, this.rootModel.rasterSize.height - abstand));
        player.dir = this.random(0, 3);
        //this.addVector(player.vector, user.uid);
        game.players.push(player);

        console.log('adding ' + user.name + ' as a player', player);

        return false;
      });
    });

    console.log('broadcast game ', game);
    this.lobbiesRepository.set('game', game);
    setTimeout(() => {
      this.lobbyManager.sendEvent('start', true);
    }, 1000);
  }
}
