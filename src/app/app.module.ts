import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {FirebaseService} from "../services/firebaseService";
import {StateService} from "../services/stateService";
import {GameLoop} from "../logic/gameLoop";
import {LobbyManager} from "../services/lobbyManager";
import {MessageService} from "../services/messageService";
import {GameManager} from "../services/gameManager";
import {RootModel} from "../model/root";
import * as firebase from "firebase";
import {ReversePipe} from "../pipes/reversePipe";

var config = {
  apiKey: "AIzaSyBjlIv01oUjaN-SPiv6KY-Rxd3ILO0D478",
  authDomain: "liner-ac330.firebaseapp.com",
  databaseURL: "https://liner-ac330.firebaseio.com",
  storageBucket: "liner-ac330.appspot.com",
  messagingSenderId: "54054957591"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [
    AppComponent, ReversePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [FirebaseService, GameLoop, StateService, LobbyManager, MessageService, GameManager, RootModel],
  bootstrap: [AppComponent]
})
export class AppModule { }
