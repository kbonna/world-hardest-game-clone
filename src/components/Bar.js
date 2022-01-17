import React from "react";
import * as styles from "./Bar.module.scss";

const Bar = ({ deathCount, currentLevelIndex, numberOfLevels, isMenuShowed, onMenuClick }) => {
  return (
    <div className={styles.Bar}>
      <div className={styles.Bar_buttonBox}>
        <button disabled={isMenuShowed} onClick={onMenuClick}>
          MENU
        </button>
      </div>
      <div className={styles.Bar_levelBox}>
        {currentLevelIndex + 1} / {numberOfLevels}
      </div>
      <div className={styles.Bar_deathBox}>DEATHS: {deathCount}</div>
    </div>
  );
};

export default Bar;
