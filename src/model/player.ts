import {Direction} from "./enums";
import {IVector, IPoint} from "./interfaces";

export class Color {
  constructor(public r: number, public g: number, public b: number) {

  }
}

export class Line {
  constructor(public x1: number, public y1: number, public x2: number, public y2: number) {

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
  color: Color;
  id: any;
  lines: Line[];

  constructor() {
    this.lines = [];
    this._pos = {x: 0, y: 0 };
    this._prevPos = {x: 0, y: 0 };
    this.alive = false;
    this.dir = Direction.Down;
    this.name = 'NONAME';
    this.color = new Color(128, 0, 0);
    this.id = -1;
  }

  get currentLine(): Line { return new Line(this._prevPos.x, this._prevPos.y, this._pos.x, this._pos.y); }

  get colorString(): string { return "rgba("+this.color.r+","+this.color.g+","+this.color.b+",255)"; }

  get pos(): IPoint { return {x: this._pos.x, y: this._pos.y }; }
  get prevPos(): IPoint { return {x: this._prevPos.x, y: this._prevPos.y }; }

  setPos(x: number, y: number) {
    this._prevPos = this.pos;
    this._pos = {x: x, y: y};

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
  }

  static fromJson(json: any): Player {
    var ret = new Player();

    ret.setPos(json._pos.x, json._pos.y);
    ret._prevPos.x = json._prevPos.x;
    ret._prevPos.y = json._prevPos.y;
    ret.alive = json.alive;
    ret.dir = json.dir;
    ret.name = json.name;
    ret.color = new Color(json.color.r, json.color.g, json.color.b);
    ret.id = json.id;

    return ret;
  }
}


