class Coin {
  RADIUS = 8;
  BORDER_LINEWIDTH = 3;
  COLOR_BODY = "#ffff00";
  COLOR_BORDER = "black";

  constructor(point, mapInstance) {
    const pointCanvas = mapInstance.arrayPointToCanvasPoint(point);
    this.x = pointCanvas[0];
    this.y = pointCanvas[1];
    this.isTaken = false;
  }

  draw(ctx) {
    if (!this.isTaken) {
      ctx.fillStyle = this.COLOR_BODY;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      // Border
      ctx.strokeStyle = this.COLOR_BORDER;
      ctx.lineWidth = this.BORDER_LINEWIDTH;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  take() {
    this.isTaken = true;
  }

  reset() {
    this.isTaken = false;
  }
}

export default Coin;
