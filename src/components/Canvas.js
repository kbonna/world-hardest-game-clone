import React from "react";
import * as styles from "./Canvas.module.scss";

const Canvas = ({ canvasRef, className }) => {
  return <canvas ref={canvasRef} className={className}></canvas>;
};

export default Canvas;
