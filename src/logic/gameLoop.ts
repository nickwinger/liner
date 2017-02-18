import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {Player, Line} from "../model/player";
import {RootModel} from "../model/root";
import {MessageService} from "../services/messageService";
import {LobbyManager} from "../services/lobbyManager";
import {LobbiesRepository} from "../services/lobbiesRepository";
import {Game} from "../model/game";
import {GameMath} from "./math";

@Injectable()
export class GameLoop {
  timer;
  private lobbyEventStartRef;
  private lobbyEventPlayerDiedRef;
  private playerVectorsRef;

  constructor(protected rootModel: RootModel, protected messageService: MessageService,
            protected lobbyManager: LobbyManager, protected lobbiesRepository: LobbiesRepository) {
    rootModel.currentLobbyObservable.subscribe(() => {
      if (!this.rootModel.currentLobby)
        return;

      if (this.playerVectorsRef)
        this.playerVectorsRef.off('child_added');

      if (this.lobbyEventStartRef)
        this.lobbyEventStartRef.off('value');

      this.lobbyEventStartRef = lobbiesRepository.ref('events/start');
      this.lobbyEventStartRef.on('value', (start) => {
        if (!start.val() || start.val() == null)
          return;

        console.log('game start');
        this.start();
      });

      if (this.lobbyEventPlayerDiedRef)
        this.lobbyEventPlayerDiedRef.off('value');
      this.lobbyEventPlayerDiedRef = lobbiesRepository.ref('events/playerDied');
      this.lobbyEventPlayerDiedRef.on('value', (playerDied) => {
        if (!playerDied.val() || playerDied.val() == null)
          return;

        console.log('player died ', playerDied.val());
        this.rootModel.currentGame.getPlayerById(playerDied.val()).alive = false;
      });
    });
  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  stop() {
    if (this.playerVectorsRef) {
      this.playerVectorsRef.off('child_added');
    }
    this.lobbiesRepository.remove('game');

    clearInterval(this.timer);
  }

  setPlayerDead(player: Player) {
    player.alive = false;
    this.lobbyManager.writeLn('Player ' + player.name + ' crashed', player.color);
    this.lobbyManager.sendEvent('playerDied', player.id);
  }

  isCurrentPlayerLineIntersectingOther(): boolean {
    var currentPlayer = this.rootModel.currentGame.getPlayerById(this.user.uid);
    var ret = false;

    this.rootModel.currentGame.players.forEach((player) => {
      player.lines.forEach((line) => {
        if (GameMath.lineIntersect(currentPlayer.currentLine, line))
          ret = true;
      });
      // Also check the currentLine of other players
      if (player.id != this.user.uid && GameMath.lineIntersect(currentPlayer.currentLine, player.currentLine))
        ret = true;
    });

    return ret;
  }

  updateGame() {
    if (!this.rootModel.currentGame.isRunning) {
      console.log('stopping game', this.rootModel.currentGame);
      this.stop();
      return;
    }

    this.rootModel.currentGame.players.forEach((player) => {
      if (player.alive) {
        player.move();

        // Only check alive condition for ourselves
        if (player.id == this.user.uid) {
          if (player.pos.y <= 0 || player.pos.y >= this.rootModel.rasterSize.height || player.pos.x <= 0 || player.pos.x >= this.rootModel.rasterSize.width)
            this.setPlayerDead(player);

          if (this.isCurrentPlayerLineIntersectingOther())
            this.setPlayerDead(player);
        }
      }
    });
  }

  get currentGame(): Game { return this.rootModel.currentGame; }
  set currentGame(value: Game) { this.rootModel.currentGame = value; }

  start() {
    this.playerVectorsRef = this.lobbiesRepository.ref('lines');
    this.playerVectorsRef.on('child_added', (snapshot: firebase.database.DataSnapshot) => {
      var userVector = snapshot.val();

      let player = this.currentGame.getPlayerById(userVector.userId);
      player.lines.push(Line.fromJson(userVector.line));
      player.setPos(userVector.line.x2, userVector.line.y2);
      player.dir = userVector.dir;
    });

    var loops = 0, skipTicks = 1000 / this.currentGame.fps,
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
  }
}
