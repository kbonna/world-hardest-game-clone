import React from "react";
import PropTypes from "prop-types";
import * as styles from "./Menu.module.scss";
import { GAME_STATUS } from "../game/constants";

const Menu = ({ className, onRestart, onResume, gameStatus }) => {
  let buttonText;
  let message;
  switch (gameStatus) {
    case GAME_STATUS.INITIAL:
      buttonText = "Start";
      message = "Welcome to the World's Hardest Game";
      break;
    case GAME_STATUS.RUNNING:
      buttonText = "Restart";
      message = "Game is paused";
      break;
    case GAME_STATUS.ENDED:
      buttonText = "Play again";
      message = "Congratulations for finishing the World's Hardest Game!";
      break;
  }

  return (
    <div className={`${styles.Menu} ${className}`}>
      <p className={styles.Menu_message}>{message}</p>
      {gameStatus === GAME_STATUS.RUNNING ? (
        <button className={styles.Menu_button} onClick={onResume}>
          Resume
        </button>
      ) : null}
      <button className={styles.Menu_button} onClick={onRestart}>
        {buttonText}
      </button>
    </div>
  );
};

Menu.propTypes = {
  onRestart: PropTypes.func,
  class: PropTypes.string,
};

export default Menu;
