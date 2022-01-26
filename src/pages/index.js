import * as React from "react";
import * as styles from "./index.module.scss";
import { useState, useRef, useEffect, createRef } from "react";
import { graphql } from "gatsby";

import Bar from "./../components/Bar";
import Menu from "../components/Menu";
import Canvas from "../components/Canvas";
import Footer from "../components/Footer";

import { GAME_STATUS } from "../game/constants";
import { setGameObjects, setKeyControls } from "../game/utils";
import { update } from "../game";

// Create game keys
const { keysPressed, onKeyUp, onKeyDown } = setKeyControls();

const IndexPage = ({ data }) => {
  const levels = data.allContentfulLevel.nodes;
  const [game, setGame] = useState({});
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [deathCount, setDeathCount] = useState(0);
  const [isMenuShowed, setIsMenuShowed] = useState(true);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.INITIAL);
  const [audioRefs, setAudioRefs] = useState({});
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const animationRef = useRef(null);

  const onLevelFinished = () => {
    audioRefs.audioLevelUpRef.current.play();
    if (currentLevelIndex + 1 === levels.length) {
      setIsMenuShowed(true);
      setGameStatus(GAME_STATUS.ENDED);
    } else {
      setCurrentLevelIndex((prevLevel) => prevLevel + 1);
    }
  };

  const onDeath = () => {
    audioRefs.audioCrashRef.current.play();
    setDeathCount((prevDeathCount) => prevDeathCount + 1);
  };

  const onCoinPickup = () => {
    audioRefs.audioCoinRef.current.play();
  };

  const onMenuClick = () => {
    setIsMenuShowed(true);
  };

  const onRestart = () => {
    // canvasRef.current.focus();
    document.activeElement.blur();
    setIsMenuShowed(false);
    if (currentLevelIndex === 0) {
      setGameObjects(levels[currentLevelIndex], canvasRef, boardRef, setGame);
    } else {
      setCurrentLevelIndex(0);
    }
    setDeathCount(0);
    setTimeout(() => {
      // avoid menu UI rapid change before board is flipped
      setGameStatus(GAME_STATUS.RUNNING);
    }, 500);
  };

  const onResume = () => {
    setIsMenuShowed(false);
  };

  const gameLoop = () => {
    // loop is running only when menu is hidden
    if (!isMenuShowed) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    game.map.draw(game.ctx);
    game.map.drawEdges(game.ctx);
    game.player.move(keysPressed);
    game.player.draw(game.ctx);

    update(game.player, game.enemies, game.coins, onDeath, onCoinPickup, onLevelFinished);

    game.coins.forEach((coin) => coin.draw(game.ctx));
    game.enemies.forEach((enemy) => enemy.move());
    game.enemies.forEach((enemy) => enemy.draw(game.ctx));
  };

  useEffect(() => {
    // When level is changed recreate game objects for new level
    setGameObjects(levels[currentLevelIndex], canvasRef, boardRef, setGame);
  }, [currentLevelIndex, levels]);

  useEffect(() => {
    // Run and cancel game loop when menu is switched and new game is loaded
    if (game.map) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      animationRef.current = requestAnimationFrame(gameLoop);

      return () => {
        cancelAnimationFrame(animationRef.current);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }
  }, [game, isMenuShowed]);

  useEffect(() => {
    const audioCoinRef = createRef(null);
    const audioCrashRef = createRef(null);
    const audioLevelUpRef = createRef(null);
    setAudioRefs({
      audioCoinRef,
      audioCrashRef,
      audioLevelUpRef,
    });
  }, []);

  const boardClassNames = `${styles.Board} ${isMenuShowed ? styles.Board___isFlipped : ""}`;

  return (
    <>
      {/* eslint-disable-next-line */}
      <audio ref={audioRefs.audioCoinRef} src="./coin.wav"></audio>
      {/* eslint-disable-next-line */}
      <audio ref={audioRefs.audioCrashRef} src="./crash.wav"></audio>
      {/* eslint-disable-next-line */}
      <audio ref={audioRefs.audioLevelUpRef} src="./level_up.mp3"></audio>
      <main className={styles.Main}>
        <div className={styles.Wrapper}>
          <Bar
            deathCount={deathCount}
            currentLevelIndex={currentLevelIndex}
            numberOfLevels={levels.length}
            isMenuShowed={isMenuShowed}
            onMenuClick={onMenuClick}
          />
          <div ref={boardRef} className={boardClassNames}>
            <Canvas className={styles.Board_back} canvasRef={canvasRef} />
            <Menu
              className={styles.Board_front}
              onRestart={onRestart}
              onResume={onResume}
              gameStatus={gameStatus}
            />
          </div>
        </div>
      </main>
      <Footer className={styles.Footer} />
    </>
  );
};

export const query = graphql`
  {
    allContentfulLevel(sort: { fields: levelNumber, order: ASC }) {
      nodes {
        id
        levelName
        levelNumber
        mapScheme {
          raw
        }
        config {
          playerRespawns
          coins
          enemies {
            type
            speed
            checkpoints
            origin
            radius
            angle
          }
        }
      }
    }
  }
`;

export default IndexPage;
