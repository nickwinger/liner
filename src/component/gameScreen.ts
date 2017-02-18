import {Component, ViewChild, ElementRef} from "@angular/core";
import {RootModel} from "../model/root";
import {Game} from "../model/game";
import {IPoint} from "../model/interfaces";
@Component({
  selector: 'game-screen',
  templateUrl: './gameScreen.html',
  styleUrls: ['./gameScreen.css']
})

export class GameScreen {
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('rightDiv') rightDiv: ElementRef;
  viewbox: any;
  followPlayer: boolean;
  zoom: number;
  svgTransform: string;

  constructor(public rootModel: RootModel) {
    this.followPlayer = true;
    this.zoom = 2;

    this.viewbox = {
      x: 0, y: 0, w: this.currentGame.size.width / this.zoom, h: this.currentGame.size.height / this.zoom
    };

    this.svgTransform = this.makeSvgTransform(0, 0);
    // Follow the players position
    this.currentGame.me.posChanged.subscribe((pos: IPoint) => {
      //this.viewbox.x = pos.x - this.viewbox.w / 2;
      //this.viewbox.y = pos.y - this.viewbox.h / 2;

      if (this.followPlayer)
        this.svgTransform = this.makeSvgTransform((pos.x * -1) + this.viewbox.w / 2, (pos.y * -1) + this.viewbox.h / 2);
        //this.svgTransform = this.makeSvgTransform(pos.x - this.viewbox.w / 2, pos.y - this.viewbox.h / 2);
      else
        this.svgTransform = this.makeSvgTransform(0, 0);
    });
  }

  makeSvgTransform(x: number, y: number): string {
    return 'translate3d(' + x + 'px,' + y + 'px, 0)';
  }

  get currentGame(): Game { return this.rootModel.currentGame; }

  //get viewBox(): string { return this.viewbox.x + ' ' + this.viewbox.y + ' ' + this.viewbox.w + ' ' + this.viewbox.h; }
  getViewBox(): string {
    return this.viewbox.x + ' ' + this.viewbox.y + ' ' + this.viewbox.w + ' ' + this.viewbox.h;
  }

  ngAfterViewInit() {
    // max the width of the main svg canvas
    var svg = <SVGElement>this.canvas.nativeElement;
    var svgContainer = <HTMLDivElement>this.rightDiv.nativeElement;
    var size = Math.min(svgContainer.offsetWidth, svgContainer.offsetHeight);
    size -= 40; // Padding
    svg.setAttribute("width", size.toString());
    svg.setAttribute("height", size.toString());


  }
}
