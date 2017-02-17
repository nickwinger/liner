import * as _ from "lodash";

import {Player} from "./player";

export class Game {
  players: Player[];

  constructor() {
    this.players = [];
  }

  getPlayerById(id: string): Player {
      return _.find(this.players, (player) => player.id == id);
  }

  static fromJson(json: any): Game {
    var ret = new Game();

    json.players.forEach((playerJson) => {
      ret.players.push(Player.fromJson(playerJson));
    });

    return ret;
  }
}
