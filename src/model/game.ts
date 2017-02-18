import * as _ from "lodash";
import * as firebase from "firebase";

import {Player, Line} from "./player";
import {ISize} from "./interfaces";

export class Game {
  players: Player[];
  fps: number;
  startCounter: number;
  lines: Line[];
  size: ISize;

  constructor() {
    this.players = [];
    this.fps = 20;
    this.startCounter = 3;
    this.size = {width: 250, height: 250};

    // Default lines
    this.lines = [];
    this.lines.push(new Line(0, 0, this.size.width, 0));
    this.lines.push(new Line(0, 0, 0, this.size.height));
    this.lines.push(new Line(this.size.width, 0, this.size.width, this.size.height));
    this.lines.push(new Line(0, this.size.height, this.size.width, this.size.height));
  }

  get viewBox(): string {
    return '0 0 '+ this.size.width + ' ' + this.size.height;
  }

  getPlayerById(id: string): Player {
      return _.find(this.players, (player) => player.id == id);
  }
  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  get me(): Player {
    return _.find(this.players, (user: Player) => user.id == this.user.uid);
  }


  get isRunning(): boolean {
    return !_.every(this.players, (player: Player) => !player.alive);
  }

  fromJson(json: any) {
    this.players = [];
    json.players.forEach((playerJson) => {
      this.players.push(Player.fromJson(playerJson));
    });
    this.fps = json.fps;
  }

  static fromJson(json: any): Game {
    var ret = new Game();

    ret.fromJson(json);

    return ret;
  }
}
