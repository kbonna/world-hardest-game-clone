const handlePlayerEnemyCollision = (player, enemies, coins, onDeath) => {
  if (enemies.some((enemy) => player.isColliding(enemy))) {
    onDeath();
    coins.forEach((coin) => coin.reset());
    player.respawn();
  }
};

const handlePlayerCoinCollision = (player, coins, onCoinPickup) => {
  coins.forEach((coin) => {
    if (player.isColliding(coin) && !coin.isTaken) {
      onCoinPickup();
      coin.take();
    }
  });
};

const handlePlayerCheckpointVisit = (player, coins, onLevelFinished) => {
  const [i, j] = player.mapInstance.canvasPointToArrayPoint([player.x, player.y]);
  const currentCellCode = player.mapInstance.mapArray[i][j];
  player.updateRespawn(currentCellCode);
  if (coins.every((coin) => coin.isTaken) && currentCellCode === player.mapInstance.END_CELL_CODE) {
    onLevelFinished();
  }
};

const update = (player, enemies, coins, onDeath, onCoinPickup, onLevelFinished) => {
  handlePlayerEnemyCollision(player, enemies, coins, onDeath);
  handlePlayerCoinCollision(player, coins, onCoinPickup);
  handlePlayerCheckpointVisit(player, coins, onLevelFinished);
};

export default update;
