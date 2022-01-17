import { DIRECTION } from "./constants";

class Player {
  WIDTH = 30;
  SPEED = 3;
  BORDER_LINEWIDTH = 4;
  COLOR_BODY = "#fe0002";
  COLOR_BORDER = "black";

  constructor(respawnPoints, mapInstance) {
    // Player is always bound to the map
    this.mapInstance = mapInstance;
    // Array of respawn points in canvas units
    this.respawnPoints = respawnPoints.map(this.mapInstance.arrayPointToCanvasPoint);
    // Set current respawn point and respawn
    this.currentRespawn = 0;
    this.respawn();
  }

  updateRespawn(cellCode) {
    if (["1", "2", "3", "4", "5"].includes(cellCode)) {
      const respawnId = parseInt(cellCode) - 1;
      if (respawnId > this.currentRespawn) {
        this.currentRespawn = respawnId;
      }
    }
  }

  respawn() {
    this.x = this.respawnPoints[this.currentRespawn][0];
    this.y = this.respawnPoints[this.currentRespawn][1];
  }

  draw(ctx) {
    ctx.fillStyle = this.COLOR_BODY;
    ctx.fillRect(this.x - 0.5 * this.WIDTH, this.y - 0.5 * this.WIDTH, this.WIDTH, this.WIDTH);
    // Border
    ctx.strokeStyle = this.COLOR_BORDER;
    ctx.lineWidth = this.BORDER_LINEWIDTH;
    ctx.beginPath();
    ctx.rect(this.x - 0.5 * this.WIDTH, this.y - 0.5 * this.WIDTH, this.WIDTH, this.WIDTH);
    ctx.stroke();
  }

  move(keysPressed) {
    if (keysPressed["ArrowUp"] && !this.isCollidingWall(DIRECTION.UP)) {
      this.y -= this.SPEED;
    }
    if (keysPressed["ArrowDown"] && !this.isCollidingWall(DIRECTION.DOWN)) {
      this.y += this.SPEED;
    }
    if (keysPressed["ArrowLeft"] && !this.isCollidingWall(DIRECTION.LEFT)) {
      this.x -= this.SPEED;
    }
    if (keysPressed["ArrowRight"] && !this.isCollidingWall(DIRECTION.RIGHT)) {
      this.x += this.SPEED;
    }
  }

  /**
   * Determine if a point relative to the player position is outside of the map.
   *
   *  Relative player coordinates for X and Y axis. For pair of numbers (innerX, innerY) these
   *  values correspond to specific player parts:
   *   - (0, 0): top-left corner
   *   - (0, 1): bottom-left corner
   *   - (1, 0): top-right corner
   *   - (1, 1): bottom-right corner
   *   - (.5, .5): player center
   * @param {number} innerX
   * @param {number} innerY
   *  Additional shift of the player in canvas pixel units. Used to calculate decision after
   *  hypothetical player movement. Both values default to 0.
   * @param {number} shiftX
   * @param {number} shiftY
   * @returns
   *  Decision if a specific location of the player square is outside of the map.
   */
  isOutside({ innerX, innerY, shiftX = 0, shiftY = 0 } = {}) {
    const indexCanvasX = this.mapInstance.canvasToArray(this.x + innerX * this.WIDTH + shiftX);
    const indexCanvasY = this.mapInstance.canvasToArray(this.y + innerY * this.WIDTH + shiftY);
    const cellCode = this.mapInstance.mapArray?.[indexCanvasY]?.[indexCanvasX];
    return cellCode === this.mapInstance.OUTSIDE_CELL_CODE || cellCode === undefined;
  }

  // generate arguments for map collision detection method depending on direction
  collisionMap = {
    [DIRECTION.UP]: [
      { innerX: -0.5, innerY: -0.5, shiftX: 0, shiftY: -this.SPEED },
      { innerX: 0.5, innerY: -0.5, shiftX: 0, shiftY: -this.SPEED },
    ],
    [DIRECTION.DOWN]: [
      { innerX: -0.5, innerY: 0.5, shiftX: 0, shiftY: this.SPEED },
      { innerX: 0.5, innerY: 0.5, shiftX: 0, shiftY: this.SPEED },
    ],
    [DIRECTION.LEFT]: [
      { innerX: -0.5, innerY: -0.5, shiftX: -this.SPEED, shiftY: 0 },
      { innerX: -0.5, innerY: 0.5, shiftX: -this.SPEED, shiftY: 0 },
    ],
    [DIRECTION.RIGHT]: [
      { innerX: 0.5, innerY: -0.5, shiftX: this.SPEED, shiftY: 0 },
      { innerX: 0.5, innerY: 0.5, shiftX: this.SPEED, shiftY: 0 },
    ],
  };

  /**
   * Determine whether player moving in a specific direction with collide with map wall after
   * calling move method on a player. Implemented by checking future position of two player corners
   * which potentially extend beyound a map boundary.
   *
   * @param {string} direction
   *  One of four possible move directions.
   * @returns Bool decision if collision will happen.
   */
  isCollidingWall(direction) {
    return this.collisionMap[direction]
      .map((collisionArgsObj) => this.isOutside({ ...collisionArgsObj }))
      .some((isOutside) => isOutside);
  }

  /**
   * Determine if a player is colliding with a certain object.
   *
   * @param {GameObject} object
   *  Game object having x, y, and RADIUS properties.
   * @returns
   *  Boolean.
   */
  isColliding(object) {
    return (
      Math.sqrt((this.x - object.x) ** 2 + (this.y - object.y) ** 2) <
      this.WIDTH / 2 + object.RADIUS
    );
  }
}

export default Player;
