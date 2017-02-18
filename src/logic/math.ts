import {Line} from "../model/player";

export class GameMath {
  static isLineIntersect(x1,y1,x2,y2, x3,y3,x4,y4): boolean {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
      return false;
    } else {
      if (x1>=x2) {
        if (!(x2<=x&&x<=x1)) {return false;}
      } else {
        if (!(x1<=x&&x<=x2)) {return false;}
      }
      if (y1>=y2) {
        if (!(y2<=y&&y<=y1)) {return false;}
      } else {
        if (!(y1<=y&&y<=y2)) {return false;}
      }
      if (x3>=x4) {
        if (!(x4<=x&&x<=x3)) {return false;}
      } else {
        if (!(x3<=x&&x<=x4)) {return false;}
      }
      if (y3>=y4) {
        if (!(y4<=y&&y<=y3)) {return false;}
      } else {
        if (!(y3<=y&&y<=y4)) {return false;}
      }
    }
    return true;
  }

  static lineIntersect(l1: Line, l2: Line): boolean {
    return this.isLineIntersect(l1.x1, l1.y1, l1.x2, l1.y2, l2.x1, l2.y1, l2.x2, l2.y2);
  }

  static linesIntersect(line: Line, lines: Line[]): boolean {
    var ret = false;
    lines.forEach((l) => {
      if (GameMath.lineIntersect(line, l))
        ret = true;
    });

    return ret;
  }
}
