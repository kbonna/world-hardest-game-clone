import { Map, Player, LinearEnemy, RadialEnemy, Coin } from "./index";

const loadGameObjects = (currentLevel) => {
  const map = new Map(JSON.parse(currentLevel.mapScheme.raw).content[0].content[0].value);
  const player = new Player(currentLevel.config.playerRespawns, map);
  const coins = currentLevel.config.coins.map((point) => new Coin(point, map));
  const enemies = currentLevel.config.enemies.map((enemy) => {
    if (enemy.type === "linear") {
      return new LinearEnemy(enemy.checkpoints, enemy.speed, map);
    } else if (enemy.type === "radial") {
      return new RadialEnemy(enemy.origin, enemy.radius, enemy.angle, enemy.speed, map);
    } else {
      throw new Error(`enemy of type ${enemy.type} not implemented`);
    }
  });
  return { map, player, coins, enemies };
};

// const loadGameObjectsJson = (currentLevel) => {
//   const map = new Map(currentLevel.mapScheme);
//   const player = new Player(currentLevel.config.playerRespawns, map);
//   const coins = currentLevel.config.coins.map((point) => new Coin(point, map));
//   const enemies = currentLevel.config.enemies.map((enemy) => {
//     if (enemy.type === "linear") {
//       return new LinearEnemy(enemy.checkpoints, enemy.speed, map);
//     } else if (enemy.type === "radial") {
//       return new RadialEnemy(enemy.origin, enemy.radius, enemy.angle, enemy.speed, map);
//     } else {
//       throw new Error(`enemy of type ${enemy.type} not implemented`);
//     }
//   });
//   return { map, player, coins, enemies };
// };

export const setGameObjects = (currentLevel, canvasRef, boardRef, setGame) => {
  // Create game objects
  const { map, player, coins, enemies } = loadGameObjects(currentLevel);
  //   Set canvas for current map
  const ctx = canvasRef.current.getContext("2d");
  canvasRef.current.width = map.canvasWidth;
  canvasRef.current.height = map.canvasHeight;
  boardRef.current.style.aspectRatio = map.canvasAspectRatio;
  ctx.translate(...map.canvasTranslate);

  setGame({
    map,
    player,
    enemies,
    coins,
    ctx,
  });
};

export const setKeyControls = () => {
  const keysPressed = {};
  const onKeyDown = (e) => {
    keysPressed[e.code] = true;
  };
  const onKeyUp = (e) => {
    delete keysPressed[e.key];
  };
  return { keysPressed, onKeyUp, onKeyDown };
};
