import * as firebase from "firebase";
import {Injectable, HostListener} from "@angular/core";
import {MessageService} from "./messageService";
import {RootModel} from "../model/root";
import {Lobby} from "../model/lobby";
import {LobbyUser} from "../model/lobbyUser";
import {IMessage} from "../model/interfaces";

@Injectable()
export class LobbyManager {
  lobbies: Lobby[];
  protected lobbyMessagesRef;

  constructor(protected messageService: MessageService, protected rootModel: RootModel) {
    this.lobbies = [];

    var lobbiesRef = firebase.database().ref('lobbies');
    lobbiesRef.once('value', (lobbiesSnapshot) => {
      console.log('lobbies', lobbiesSnapshot.val(), lobbiesSnapshot.exists(), lobbiesSnapshot.hasChildren());
      lobbiesSnapshot.forEach((lobbySnapshot) => {
        this.lobbies.push(Lobby.fromJson(lobbySnapshot.val()));
        return false;
      });
    });

    lobbiesRef.on('child_added', (lobby) => {
      console.log('lobby added', lobby.val());
      this.lobbies.push(Lobby.fromJson(lobby.val()));
    });

  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  get currentLobby(): Lobby { return this.rootModel.currentLobby; }
  set currentLobby(value: Lobby) { this.rootModel.currentLobby = value; }

  leaveLobby() {console.log('unload', this.currentLobby);
    if (!this.currentLobby)
      return;

    this.lobbyMessagesRef.off('value');

    var s = 'lobbies/' + this.currentLobby.name + '/users/' + this.user.uid;
    firebase.database().ref(s).remove((err) => {console.log('removed', err);
      // if lobby is empty delete it
      firebase.database().ref('lobbies/' + this.currentLobby.name + '/users').once('value', (snapshot) => {
        console.log('users left', snapshot.exists(), snapshot.hasChildren());
        if (!snapshot.hasChildren())
          firebase.database().ref('lobbies/' + this.currentLobby.name).remove();
      });
    });
  }

  writeLn(text: string, color?: string) {
    if (!this.currentLobby)
      return;

    var d = new Date();
    if (!color)
      color = '#000';

    if (!color && this.currentLobby.me)
      color = this.currentLobby.me.color;

    firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/events/message').set(<IMessage>{
      text: d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ' ' + text, color: color
    });
  }

  join(name: string) {
    this.currentLobby = new Lobby();

    // Listen for new users
    firebase.database().ref('lobbies/' + this.currentLobby.name + '/users').on('child_added', (userJson) => {
      let user = LobbyUser.fromJson(userJson.val());
      this.writeLn(user.name + ' joined the lobby', user.color);
      console.log('user added', user);
      this.currentLobby.users.push(user);
    });

    var name = this.user.displayName;
    if (this.user.isAnonymous)
      name = window.prompt("Wie ist Dein Name ?");

    // We need to give the new lobby user a unique color, so get all lobby users to check which color is available
    firebase.database().ref('lobbies/' + this.currentLobby.name + '/users').once('value', (snapshot) => {

      firebase.database().ref('lobbies/' + this.currentLobby.name + '/users/' + this.user.uid).set({
        uid: this.user.uid, name: name, colorId: snapshot.numChildren()
      });

      this.lobbyMessagesRef = firebase.database().ref('lobbies/' + this.currentLobby.name + '/events/message');
      this.lobbyMessagesRef.on('value', (message) => {
        if (message.val() && message.val() != null)
          this.currentLobby.messagesSubject.next(message.val());
      });
    });
  }
}
