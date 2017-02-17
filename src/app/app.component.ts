import {Component, HostListener, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {StateService} from "../services/stateService";
import * as firebase from "firebase";
import {LobbyManager} from "../services/lobbyManager";
import {IMessage} from "../model/interfaces";
import {MessageService} from "../services/messageService";
import {GameManager} from "../services/gameManager";
import {RootModel} from "../model/root";
import {GameLoop} from "../logic/gameLoop";
import {Direction} from "../model/enums";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  constructor(public state: StateService, public lobbyManager: LobbyManager,
            public messageService: MessageService, public gameManager: GameManager,
          public rootModel: RootModel, public gameLoop: GameLoop, protected changeRef: ChangeDetectorRef) {

  }

  private _user: firebase.User;
  get user(): firebase.User {
    if (!this._user)
      this._user = firebase.auth().currentUser;

    return this._user;
  }

  onEnterMessage(event: KeyboardEvent) {
    var inputField = <HTMLInputElement>event.target;
    this.lobbyManager.writeLn(this.rootModel.currentLobby.me.name + ' - ' + inputField.value, this.rootModel.currentLobby.me.color);
    inputField.value = '';
  }

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 38: // Up
        break;
      case 40:  // Down
        break;
      case 37:  // Left
        if (this.rootModel.currentGame)
          this.gameManager.playerTurnLeft();
        break;
      case 39:  // Right
        if (this.rootModel.currentGame)
          this.gameManager.playerTurnRight();
        break;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    this.lobbyManager.leaveLobby();
    //event.returnValue = "You are logged out of the Lobby";
    //return event.returnValue;
  }

  get isLoggedIn(): boolean {
    return this.state.user && this.state.user != null;
  }

  joinLobby(name: string) {

    this.rootModel.rasterSize = {
      width: 500,
      height: 500
    };

    this.lobbyManager.join(name);
  }

  loginAnonym() {
    firebase.auth().signInAnonymously().catch(function(error) {
      console.log('login anonym error', error);
      alert(error);
    });
  }

  loginGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      this.state.user = result.user;
      console.log('singed in user ', this.state.user);

      /*firebase.database().ref('message').set('User ' + user.displayName + ' has joined.');
      player.id = user.uid;
      player.name = user.displayName;
      setPlayerToState();
      sendState();*/

      // ...
    }).catch(function(error) {
      console.log('login error', error);
      var errorMessage = error.message;
    });
  }

  start() {

    this.gameManager.newGame();
  }

  ngAfterViewInit() {

    this.rootModel.currentLobbyObservable.subscribe(() => {
      if (!this.rootModel.currentLobby)
        return;

      this.rootModel.currentLobby.messagesSubject.subscribe(() => {
        this.changeRef.markForCheck();
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }, 10);
      });
    });

    firebase.auth().onAuthStateChanged(function(user) {
      console.log('auth changed', user);
    });


    /*
    var user = firebase.auth().currentUser;
    if (user) {
      firebase.database().ref('message').set('User ' + user.displayName + ' has joined.');
      player.id = user.uid;
      player.name = user.displayName;
      setPlayerToState();
      sendState();
    }

    var stateRef = firebase.database().ref('message');
    stateRef.on('value', function(snapshot) {
      printLn(snapshot.val());
    });

    var stateRef = firebase.database().ref('state');
    stateRef.on('value', function(snapshot) {
      updateState(snapshot.val());
    });

    var stateRef = firebase.database().ref('players');
    stateRef.on('child_changed', function(snapshot) {
      var changedPlayer = snapshot.val();
      //if (changedPlayer.id == player.id)
      //	return;

      drawPlayer(changedPlayer);
    });*/
  }
}
