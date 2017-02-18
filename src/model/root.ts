import {ISize} from "./interfaces";
import {Injectable} from "@angular/core";
import {Game} from "./game";
import {Subject, BehaviorSubject, Observable} from "rxjs";
import {Lobby} from "./lobby";

@Injectable()
export class RootModel {
  rasterSize: ISize;
  state: string;
  currentGame: Game;

  private currentLobbySubject: BehaviorSubject<Lobby>;
  get currentLobby(): Lobby { return this.currentLobbySubject.getValue(); }
  set currentLobby(value: Lobby) {
    this.currentLobbySubject.next(value);
  }
  get currentLobbyObservable(): Observable<Lobby> { return this.currentLobbySubject.asObservable(); }

  constructor() {
    this.currentLobbySubject = new BehaviorSubject<Lobby>(undefined);
    this.currentGame = new Game();
    this.state = 'none';
  }
}
