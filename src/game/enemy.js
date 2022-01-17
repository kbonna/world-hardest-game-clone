const DEFAULT_LINEAR_ENEMY_SPEED = 6;
const DEFAULT_RADIAL_ENEMY_SPEED = -3;

const degToRad = (deg) => (Math.PI * deg) / 180;

class Enemy {
  RADIUS = 11;
  CIRCLE_BORDER_LINEWIDTH = 3;
  COLOR_BODY = "#0000fb";
  COLOR_BORDER = "black";

  draw(ctx) {
    ctx.fillStyle = this.COLOR_BODY;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    // Border
    ctx.strokeStyle = this.COLOR_BORDER;
    ctx.lineWidth = this.CIRCLE_BORDER_LINEWIDTH;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/**
 * Represents enemies moving in a circle around an anchor point.
 */
class RadialEnemy extends Enemy {
  /**
   *
   * @param {Array<number>} origin
   *  Anchor point in array coordinates.
   * @param {number} radius
   *  Movement radius in array coordinates.
   * @param {number} angle
   *  Initial angle in degrees. Zero represents south direction.
   * @param {number} speed
   *  Angular speed for enemy ball. Positive values correspond to counter-clockwise movement,
   *  whereas negative values denote clockwise rotations.
   * @param {Map} mapInstance
   *  Map instance on which enemy is drawn.
   */
  constructor(origin, radius, angle, speed, mapInstance) {
    super();
    // Recalculate points and lengths to canvas pixel units
    this.origin = mapInstance.arrayPointToCanvasPoint(origin);
    this.radius = mapInstance.POINTS_PER_CELL * radius;
    this.angle = degToRad(angle);

    // Initial position
    this.recalculateLinearPosition();

    // Speed
    this.speed = speed || DEFAULT_RADIAL_ENEMY_SPEED;
    this.speed = degToRad(this.speed);
  }

  recalculateLinearPosition() {
    this.x = this.origin[0] + this.radius * Math.sin(this.angle);
    this.y = this.origin[1] + this.radius * Math.cos(this.angle);
  }

  move() {
    this.angle += this.speed;
    this.recalculateLinearPosition();
  }
}

class LinearEnemy extends Enemy {
  constructor(checkpoints, speed, mapInstance) {
    super();
    // Recalculate checkpoints to canvas pixel units
    this.checkpoints = checkpoints.map(mapInstance.arrayPointToCanvasPoint);

    this.nCheckpoints = this.checkpoints.length;
    this.currentCheckpoint = this.checkpoints[0];
    this.nextCheckpoint = this.checkpoints[1];
    // Initial position
    this.x = this.currentCheckpoint[0];
    this.y = this.currentCheckpoint[1];

    // Speed
    this.speed = speed || DEFAULT_LINEAR_ENEMY_SPEED;
  }

  getNextCheckpoint(checkpoint) {
    const index = this.checkpoints.findIndex(
      (point) => point[0] === checkpoint[0] && point[1] === checkpoint[1]
    );
    return index + 1 === this.nCheckpoints ? this.checkpoints[0] : this.checkpoints[index + 1];
  }

  updateCheckpoint() {
    const distanceToCheckpoint = Math.sqrt(
      (this.x - this.nextCheckpoint[0]) ** 2 + (this.y - this.nextCheckpoint[1]) ** 2
    );
    if (distanceToCheckpoint < this.speed) {
      this.currentCheckpoint = this.nextCheckpoint;
      this.nextCheckpoint = this.getNextCheckpoint(this.nextCheckpoint);
    }
  }

  move() {
    const dx = this.nextCheckpoint[0] - this.x;
    const dy = this.nextCheckpoint[1] - this.y;
    const vecLength = Math.sqrt(dx ** 2 + dy ** 2);
    this.x += (this.speed * dx) / vecLength;
    this.y += (this.speed * dy) / vecLength;
    this.updateCheckpoint();
  }
}

export { Enemy, LinearEnemy, RadialEnemy };
