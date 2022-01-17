const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

class Map {
  POINTS_PER_CELL = 50;
  PADDING = 1;
  EDGE_LINEWIDTH = 3;
  // Map textfile codes
  SAFE_CELL_CODES = ["1", "2", "3", "4", "5", "F"];
  END_CELL_CODE = "F";
  NORMAL_CELL_CODE = "M";
  OUTSIDE_CELL_CODE = " ";
  // Map colors
  COLOR_NORMAL_CELL_LIGHT = "#f7F7ff";
  COLOR_NORMAL_CELL_DARK = "#e6e6ff";
  COLOR_SAFE_CELL = "#b6feb4";
  COLOR_OUTSIDE_CELL = "#b5b5ff";
  COLOR_EDGE = "black";

  constructor(mapString) {
    // Map conversion into array
    this.mapString = mapString;
    this.mapArray = mapString.split("\n").map((row) => row.split(""));
    this.nRows = this.mapArray.length;
    this.nCols = this.mapArray[0].length;
    // Canvas properties
    this.canvasWidth = (this.nCols + this.PADDING * 2) * this.POINTS_PER_CELL;
    this.canvasHeight = (this.nRows + this.PADDING * 2) * this.POINTS_PER_CELL;
    this.canvasAspectRatio = (this.nCols + this.PADDING * 2) / (this.nRows + this.PADDING * 2);
    this.canvasTranslate = [
      this.PADDING * this.POINTS_PER_CELL,
      this.PADDING * this.POINTS_PER_CELL,
    ];
    this.canvasOrigin = this.canvasTranslate.map((coord) => -1 * coord);
    this.mapEdges = this.collapseEdges(this.getMapEdges());
  }

  // Convert canvas pixel value to map array index
  canvasToArray(z) {
    return Math.floor(z / this.POINTS_PER_CELL);
  }

  // Convert map array index to canvas pixel value for upper-left cell corner
  arrayToCanvas(k) {
    return k * this.POINTS_PER_CELL;
  }

  // Vector version of canvasToArray
  canvasPointToArrayPoint = (p) => {
    return p.map((z) => this.canvasToArray(z)).reverse();
  };

  // Vector version of arrayToCanvas
  arrayPointToCanvasPoint = (p) => {
    return p.map((k) => this.arrayToCanvas(k)).reverse();
  };

  /**
   * Calculate edge (pair of index pairs) between two adjacent cells.
   *
   * @param {index pair} p1
   * @param {index pair} p2
   * @returns Edge represented as pair of index pairs.
   */
  getEdge(p1, p2) {
    if (p1[0] === p2[0]) {
      return p2[1] > p1[1] ? [p2, [p2[0] + 1, p2[1]]] : [p1, [p1[0] + 1, p1[1]]];
    } else if (p1[1] === p2[1]) {
      return p2[0] > p1[0] ? [p2, [p2[0], p2[1] + 1]] : [p1, [p1[0], p1[1] + 1]];
    }
    throw new Error(`cells are not adjacent`);
  }

  connectEdges(e1, e2) {
    const iValuesSet = new Set([e1[0][0], e1[1][0], e2[0][0], e2[1][0]]);
    const jValuesSet = new Set([e1[0][1], e1[1][1], e2[0][1], e2[1][1]]);
    if (jValuesSet.size === 1 && iValuesSet.size === 3) {
      const jConst = e1[0][1];
      return [
        [Math.min(...iValuesSet), jConst],
        [Math.max(...iValuesSet), jConst],
      ];
    } else if (jValuesSet.size === 3 && iValuesSet.size === 1) {
      const iConst = e1[0][0];
      return [
        [iConst, Math.min(...jValuesSet)],
        [iConst, Math.max(...jValuesSet)],
      ];
    }
    return false;
  }

  // Join adjacent edges to increase drawing performance
  collapseEdges(edges) {
    const edgesCopy = [...edges];
    const collapsedEdges = [];
    while (edgesCopy.length) {
      let poppedEdge = edgesCopy.pop();
      let stillPopping = true;
      while (stillPopping) {
        stillPopping = false;
        /* eslint-disable */
        edgesCopy.forEach((edge, index) => {
          const newEdge = this.connectEdges(edge, poppedEdge);
          if (newEdge) {
            poppedEdge = newEdge;
            stillPopping = true;
            edgesCopy.splice(index, 1);
          }
        });
      }
      collapsedEdges.push(poppedEdge);
    }
    return collapsedEdges;
  }

  // Determine if cell is inside playable area
  isInside(i, j) {
    const cellType = this.mapArray?.[i]?.[j];
    return this.SAFE_CELL_CODES.includes(cellType) || cellType === this.NORMAL_CELL_CODE;
  }

  // Determine if cell is outside playable area
  isOutside(i, j) {
    const cellType = this.mapArray?.[i]?.[j];
    return cellType === this.OUTSIDE_CELL_CODE || cellType === undefined;
  }

  drawEdge(ctx, e) {
    const p1 = e[0];
    const p2 = e[1];
    ctx.lineWidth = this.EDGE_LINEWIDTH;
    ctx.strokeStyle = this.COLOR_EDGE;
    ctx.beginPath();
    ctx.moveTo(this.arrayToCanvas(p1[1]), this.arrayToCanvas(p1[0]));
    ctx.lineTo(this.arrayToCanvas(p2[1]), this.arrayToCanvas(p2[0]));
    ctx.stroke();
  }

  drawEdges(ctx) {
    this.mapEdges.forEach((edge) => {
      this.drawEdge(ctx, edge);
    });
  }

  getMapEdges() {
    const mapEdges = [];
    // vertical edges left to right
    range(0, this.nRows).forEach((i) => {
      range(-1, this.nCols).forEach((j) => {
        if (
          (this.isInside(i, j) && this.isOutside(i, j + 1)) ||
          (this.isOutside(i, j) && this.isInside(i, j + 1))
        ) {
          mapEdges.push(this.getEdge([i, j], [i, j + 1]));
        }
      });
    });
    // horizontal edges up to down
    range(0, this.nCols).forEach((j) => {
      range(-1, this.nRows).forEach((i) => {
        if (
          (this.isInside(i, j) && this.isOutside(i + 1, j)) ||
          (this.isOutside(i, j) && this.isInside(i + 1, j))
        ) {
          mapEdges.push(this.getEdge([i, j], [i + 1, j]));
        }
      });
    });
    return mapEdges;
  }

  drawCell(ctx, i, j, cellColor) {
    ctx.fillStyle = cellColor;
    ctx.fillRect(
      this.arrayToCanvas(i),
      this.arrayToCanvas(j),
      this.POINTS_PER_CELL,
      this.POINTS_PER_CELL
    );
  }

  draw(ctx) {
    // Background
    ctx.fillStyle = this.COLOR_OUTSIDE_CELL;
    ctx.fillRect(...this.canvasOrigin, this.canvasWidth, this.canvasHeight);
    // Map
    this.mapArray.forEach((row, j) => {
      row.forEach((cell, i) => {
        if (this.SAFE_CELL_CODES.includes(cell)) {
          this.drawCell(ctx, i, j, this.COLOR_SAFE_CELL);
        } else if (cell === this.NORMAL_CELL_CODE) {
          const cellColor =
            (i + j) % 2 === 0 ? this.COLOR_NORMAL_CELL_DARK : this.COLOR_NORMAL_CELL_LIGHT;
          this.drawCell(ctx, i, j, cellColor);
        } else if (cell === this.OUTSIDE_CELL_CODE) {
          this.drawCell(ctx, i, j, this.COLOR_OUTSIDE_CELL);
        }
      });
    });
  }
}

export default Map;
