import {Directive, ElementRef, Input} from "@angular/core";
import {Line} from "../model/player";
import {Direction} from "../model/enums";

@Directive({ selector: '[playerLine]' })
export class PlayerLine {
  @Input("playerLine") line: Line;

  constructor(private el: ElementRef) {
  }

  ngDoCheck() {
    this.drawLine();
  }

  ngOnInit() {
    this.drawLine();
  }

  drawLine() {
    var svgLine = <SVGLineElement>this.el.nativeElement;

    var line = this.line.clone();
    switch (line.dir) {
      case Direction.Up: line.y1++; break;
      case Direction.Down: line.y1--; break;
      case Direction.Right: line.x1--; break;
      case Direction.Left: line.x1++; break;
    }

    svgLine.setAttribute("x1", line.x1.toString());
    svgLine.setAttribute("y1", line.y1.toString());
    svgLine.setAttribute("x2", line.x2.toString());
    svgLine.setAttribute("y2", line.y2.toString());
  }
}
