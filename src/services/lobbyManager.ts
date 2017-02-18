import * as firebase from "firebase";
import {Injectable, HostListener} from "@angular/core";
import {MessageService} from "./messageService";
import {RootModel} from "../model/root";
import {Lobby} from "../model/lobby";
import {LobbyUser} from "../model/lobbyUser";
import {IMessage} from "../model/interfaces";
import {LobbiesRepository} from "./lobbiesRepository";

@Injectable()
export class LobbyManager {
  lobbies: Lobby[];
  protected lobbyMessagesRef;
  protected newUsersRef;

  constructor(protected messageService: MessageService, protected rootModel: RootModel,
              protected lobbiesRepository: LobbiesRepository) {
    this.lobbies = [];

    this.killDeadLobbies();

    var lobbiesRef = firebase.database().ref('lobbies');

    lobbiesRef.on('child_added', (lobby) => {
      console.log('lobby added', lobby.val());
      this.lobbies.push(Lobby.fromJson(lobby.val()));
      // Immutable (to trigger angular2)
      // this.lobbies = this.lobbies.slice();
    });

  }

  killDeadLobbies() {
    firebase.database().ref('lobbies').once('value', (lobbiesSnapshot) => {
      lobbiesSnapshot.forEach((lobbySnapshot) => {
        firebase.database().ref('lobbies/' + lobbiesSnapshot.key + '/users').once('value', (usersSnapshot) => {
          if (!usersSnapshot.exists() || usersSnapshot.numChildren() == 0)
            firebase.database().ref('lobbies/' + lobbySnapshot.key).remove();
        });
        return false;
      });
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

  leaveLobby() {
    if (!this.currentLobby)
      return;

    // In a running game set our player dead
    if (this.rootModel.currentGame.isRunning&& this.rootModel.currentGame.me.alive)
      this.sendEvent('playerDied', this.rootModel.currentGame.me.id);

    this.removeListeners();

    var s = 'lobbies/' + this.currentLobby.name + '/users/' + this.user.uid;
    firebase.database().ref(s).remove((err) => {
      // if lobby is empty delete it
      firebase.database().ref('lobbies/' + this.currentLobby.name + '/users').once('value', (snapshot) => {
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

    /*firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + '/events/message').set(<IMessage>{
      text: d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ' ' + text, color: color
    });*/
    this.sendEvent('message', <IMessage>{
      text: d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ' ' + text, color: color
    });
  }

  sendEvent(name: string, value: any) {
    firebase.database().ref('lobbies/' + this.currentLobby.name + '/events/' + name).set(value);
    setTimeout(() => {
      firebase.database().ref('lobbies/' + this.currentLobby.name + '/events/' + name).remove();
    }, 1000);
  }

  removeListeners() {
    if (this.newUsersRef) {
      this.newUsersRef.off('child_added');
      this.newUsersRef.off('child_removed');
    }
    if (this.lobbyMessagesRef)
      this.lobbyMessagesRef.off('value');
  }

  join(name: string) {
    this.currentLobby = new Lobby(name);

    this.removeListeners();

    // Listen for new users
    this.newUsersRef = this.lobbiesRepository.ref('users');
    this.newUsersRef.on('child_added', (userJson) => {
      let user = LobbyUser.fromJson(userJson.val());
      this.writeLn(user.name + ' joined the lobby', user.color);

      this.currentLobby.users.push(user);
    });

    this.newUsersRef.on('child_removed', (userJson) => {
      let user = LobbyUser.fromJson(userJson.val());
      this.writeLn(user.name + ' left the lobby', user.color);

      this.currentLobby.removeUser(user.uid);
    });

    var name = this.user.displayName;
    if (this.user.isAnonymous)
      name = window.prompt("Wie ist Dein Name ?");

    // We need to give the new lobby user a unique color, so get all lobby users to check which color is available
    this.lobbiesRepository.once('users', 'value', (snapshot) => {
      this.lobbiesRepository.set('users/' + this.user.uid, {
        uid: this.user.uid, name: name, colorId: snapshot.numChildren()
      });

      this.lobbyMessagesRef = this.lobbiesRepository.ref('events/message');
      this.lobbyMessagesRef.on('value', (message) => {
        if (message.val() && message.val() != null)
          this.currentLobby.messagesSubject.next(message.val());
      });
    });
  }
}
