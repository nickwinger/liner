import {Direction} from "./enums";

export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IVector extends IPoint {
  dir: Direction;
}

export interface ILobbies {

}

export interface IMessage {
  color: string;
  text: string;
}

