import {Direction} from "./enums";
import {IVector, IPoint} from "./interfaces";
import {BehaviorSubject} from "rxjs";

export class Line {
  constructor(public x1?: number, public y1?: number, public x2?: number, public y2?: number, public dir: Direction = Direction.None) {

  }

  static fromJson(json) {
    if (!json)
      return new Line();

    return new Line(json.x1, json.y1, json.x2, json.y2, json.dir);
  }

  clone() {
    return new Line(this.x1, this.y1, this.x2, this.y2, this.dir);
  }
}

export class Vector {
  constructor(public x: number, public y: number, public dir: Direction) {

  }
}

export class Player {
  private _pos: IPoint;
  private _prevPos: IPoint;
  alive: boolean;
  dir: Direction;
  name: string;
  color: string;
  id: any;
  lines: Line[];

  posChanged: BehaviorSubject<IPoint>;

  constructor() {
    this.lines = [];
    this._pos = {x: 0, y: 0 };
    this._prevPos = {x: 0, y: 0 };
    this.alive = false;
    this.dir = Direction.Down;
    this.name = 'NONAME';
    this.id = -1;
    this.posChanged = new BehaviorSubject<IPoint>(this._pos);
  }

  get currentLine(): Line { return new Line(this._prevPos.x, this._prevPos.y, this._pos.x, this._pos.y, this.dir); }

  get pos(): IPoint { return {x: this._pos.x, y: this._pos.y }; }
  get prevPos(): IPoint { return {x: this._prevPos.x, y: this._prevPos.y }; }

  setPos(x: number, y: number) {
    this._prevPos = this.pos;
    this._pos = {x: x, y: y};

    this.posChanged.next(this._pos);

    if (this._prevPos.x == 0 && this._prevPos.y == 0)
      this._prevPos = {x: x, y: y};
  }

  get vector(): IVector { return { x: this.pos.x, y: this.pos.y, dir: this.dir }; }

  turnLeft() {

    // In order for the line drawing with prevPos to not intersect the previous line
    // we have to add one pixel into the new direction

    switch (this.dir) {
      case Direction.Up:
        this.dir = Direction.Left;
        this._pos.x--;
        break;
      case Direction.Down:
        this.dir = Direction.Right;
        this._pos.x++;
        break;
      case Direction.Left:
        this.dir = Direction.Down;
        this._pos.y++;
        break;
      case Direction.Right:
        this.dir = Direction.Up;
        this._pos.y--;
        break;
    }

    this._prevPos = this.pos;
  }

  turnRight() {
    switch (this.dir) {
      case Direction.Up:
        this.dir = Direction.Right;
        this._pos.x++;
        break;
      case Direction.Down:
        this.dir = Direction.Left;
        this._pos.x--;
        break;
      case Direction.Left:
        this.dir = Direction.Up;
        this._pos.y--;
        break;
      case Direction.Right:
        this.dir = Direction.Down;
        this._pos.y++;
        break;
    }

    this._prevPos = this.pos;
  }

  move() {
    switch (this.dir) {
      case Direction.Up:
        this._pos.y--;
        break;
      case Direction.Down:
        this._pos.y++;
        break;
      case Direction.Left:
        this._pos.x--;
        break;
      case Direction.Right:
        this._pos.x++;
        break;
    }
    this.posChanged.next(this._pos);
  }

  static fromJson(json: any): Player {
    var ret = new Player();

    ret.setPos(json._pos.x, json._pos.y);
    ret._prevPos.x = json._prevPos.x;
    ret._prevPos.y = json._prevPos.y;
    ret.alive = json.alive;
    ret.dir = json.dir;
    ret.name = json.name;
    ret.color = json.color;
    ret.id = json.id;

    return ret;
  }
}


