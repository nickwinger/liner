import {Colors} from "./enums";

export class LobbyUser {
  name: string;
  uid: string;
  colorId: number;

  get color(): string {
    return Colors[this.colorId];
  }

  static fromJson(json): LobbyUser {
    var ret = new LobbyUser();

    ret.name = json.name;
    ret.uid = json.uid;
    ret.colorId = json.colorId;

    return ret;
  }
}
