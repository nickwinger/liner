import * as firebase from "firebase";
import {Injectable} from "@angular/core";
import {RootModel} from "../model/root";

@Injectable()
export class LobbiesRepository {
  constructor(protected rootModel: RootModel) {

  }

  protected checkPath(path: string): string {
    if (path && !path.startsWith('/'))
      return '/' + path;
    return path;
  }

  ref(path: string): firebase.database.Reference {
    return firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + this.checkPath(path));
  }

  remove(path: string): firebase.Promise<any> {
    return firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + this.checkPath(path)).remove();
  }

  set(path: string, value: any): firebase.Promise<any> {
    return firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + this.checkPath(path)).set(value);
  }

  push(path: string, value: any): firebase.Promise<any> {
    return firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + this.checkPath(path)).push(value);
  }

  once(path: string, event: string, cb?: (a: firebase.database.DataSnapshot, b?: string) => any,): firebase.Promise<any> {
    return firebase.database().ref('lobbies/' + this.rootModel.currentLobby.name + this.checkPath(path)).once(event, cb);
  }
}
