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
   * @param {Point} origin
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

/**
 * Represent enemies moving with constant speed from one checkpoint to another
 */
class LinearEnemy extends Enemy {
  /**
   *
   * @param {Array<Point>} checkpoints
   *  List of subsequent checkpoints to visit by enemy.
   * @param {number} speed
   *  Linear speed for enemy ball.
   * @param {Map} mapInstance
   *  Map instance on which enemy is drawn.
   */
  constructor(checkpoints, speed, mapInstance) {
    super();
    // Recalculate checkpoints to canvas pixel units
    this.checkpoints = checkpoints.map(mapInstance.arrayPointToCanvasPoint);
    this.current = 0;
    this.next = 1;
    // Initial position
    this.x = this.checkpoints[this.current][0];
    this.y = this.checkpoints[this.current][1];

    // Speed
    this.speed = speed || DEFAULT_LINEAR_ENEMY_SPEED;
  }

  updateCheckpoints() {
    const distanceToNextCheckpoint = Math.sqrt(
      (this.x - this.checkpoints[this.next][0]) ** 2 +
        (this.y - this.checkpoints[this.next][1]) ** 2
    );
    if (distanceToNextCheckpoint < this.speed) {
      this.current = this.next;
      this.next = this.next + 1 === this.checkpoints.length ? 0 : this.next + 1;
    }
  }

  move() {
    const dx = this.checkpoints[this.next][0] - this.x;
    const dy = this.checkpoints[this.next][1] - this.y;
    const vecLength = Math.sqrt(dx ** 2 + dy ** 2);
    this.x += (this.speed * dx) / vecLength;
    this.y += (this.speed * dy) / vecLength;
    this.updateCheckpoints();
  }
}

export { Enemy, LinearEnemy, RadialEnemy };
