import React from 'react';

import GameControls from '../components/GameControls'
import GameRenderer from '../components/GameRenderer';
import G from '../Game';

import './Game.css';

export default class Game extends React.Component {
  RENDER_WIDTH = 640;
  RENDER_HEIGHT = 480;

  MODE_ROBOCAR = 0;
  MODE_CARMAGEDDON = 1;
  MODES = ['Robocar', 'Carmageddon'];

  constructor(props) {
    super(props);
    this.game = G;
    this.game.setCallback(this.gameCallback.bind(this));
    this.state = {
      mode: this.MODE_ROBOCAR,
      gameData: {},
      message: '',
      playing: false,
    };
  }

  gameCallback(gameData) {
    this.setState({
      gameData: gameData
    });

    if (gameData['gameOver']) {
      let score = gameData['score'];
      let maxScore = gameData['maxScore'];
      let message = "You've earned " + score + " points!";
      if (score === maxScore) {
        message += " That's a new record!";
      }
      this.setState({
        message: message,
        playing: false,
      })
    }
  }

  handleChangeMode = (e) => {
    this.setState({
      mode: parseInt(e.target.value, 10)
    })
  };

  handleStartGame = () => {
    this.game.start(this.state.mode);
    this.setState({
      playing: true,
    });
  };

  handleRestartGame = () => {
    this.game.restart(this.state.mode);
    this.setState({
      playing: true,
    });
  };

  render() {
    return (
      <div className="game">
        <GameControls modes={this.MODES} mode={this.state.mode} message={this.state.message}
                      handleChangeMode={this.handleChangeMode} handleStartGame={this.handleStartGame}
                      handleRestartGame={this.handleRestartGame}/>
        <GameRenderer game={this.game} width={this.RENDER_WIDTH} height={this.RENDER_HEIGHT}/>
      </div>
    )
  }
}