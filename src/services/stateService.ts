import {Injectable} from "@angular/core";
import {Player} from "../model/player";
import * as firebase from "firebase";

@Injectable()
export class StateService {
  player: Player;
  rasterHeight: number;
  rasterWidth: number;

  constructor() {
    this.player = new Player();
  }

  protected _user;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }
}
