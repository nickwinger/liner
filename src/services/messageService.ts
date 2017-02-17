import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {IMessage} from "../model/interfaces";

@Injectable()
export class MessageService {
  messages: IMessage[];

  constructor() {
    this.messages = [];
    firebase.database().ref('events/message').on('value', (message) => {
      console.log('received msg', message.val());
      if (message.val() && message.val() != null)
        this.messages.unshift(message.val());
    });
  }

  writeLn(text: string, color: string = '#000') {
    var d = new Date();

      firebase.database().ref('events/message').set(<IMessage>{
        text: d.getHours() + ':' + d.getMinutes() + ' ' + text, color: color
      });
  }
}
