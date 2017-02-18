import * as firebase from "firebase";
import * as _ from "lodash";
import {LobbyUser} from "./lobbyUser";
import {BehaviorSubject} from "rxjs";

export class Lobby {
  name: string;
  users: LobbyUser[];
  messages: string[];

  messagesSubject: BehaviorSubject<string>;

  constructor(name: string) {
    this.messagesSubject = new BehaviorSubject<string>(undefined);
    this.name = name;
    this.users = [];
    this.messages = [];

    this.messagesSubject.subscribe((msg) => {
      if (!msg)
        this.messages = [];
      else
        this.messages.unshift(msg);

      // Immutable (to trigger angular2)
      // this.messages = this.messages.slice();
    });
  }

  removeUser(userId: string) {
    _.remove(this.users, (user: LobbyUser) => user.uid == userId);
  }

  static fromJson(json): Lobby {
    return new Lobby(json.name);
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
