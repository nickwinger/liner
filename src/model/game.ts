import * as _ from "lodash";

import {Player} from "./player";

export class Game {
  players: Player[];
  fps: number;

  constructor() {
    this.players = [];
    this.fps = 20;
  }

  getPlayerById(id: string): Player {
      return _.find(this.players, (player) => player.id == id);
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
