import * as firebase from "firebase";
import * as _ from "lodash";
import {LobbyUser} from "./lobbyUser";
import {BehaviorSubject} from "rxjs";

export class Lobby {
  name: string;
  users: LobbyUser[];
  messages: string[];

  messagesSubject: BehaviorSubject<string>;

  constructor() {
    this.messagesSubject = new BehaviorSubject<string>(undefined);
    this.name = '';
    this.users = [];
    this.messages = [];

    this.messagesSubject.subscribe((msg) => {
      if (!msg)
        this.messages = [];
      else
        this.messages.unshift(msg);
    });
  }

  static fromJson(json): Lobby {
    var ret = new Lobby();

    ret.name = json.name;

    return ret;
  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  get me(): LobbyUser {
    return _.find(this.users, (user: LobbyUser) => user.uid == this.user.uid);
  }
}
