import React from 'react';
import PropType from 'prop-types';

import './GameControls.css';

export default class GameControls extends React.Component {
  static propTypes = {
    mode: PropType.number.isRequired,
    modes: PropType.array.isRequired,
    message: PropType.string.isRequired,
    handleChangeMode: PropType.func.isRequired,
    handleStartGame: PropType.func.isRequired,
    handleRestartGame: PropType.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      gameWasStarted: false,
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
  };

  handleStartGame = (e) => {
    this.setState({
      gameWasStarted: true
    });
    this.props.handleStartGame(e);
  };

  render() {
    const currentModeName = this.props.modes[this.props.mode];
    return (
      <form className="game-controls" onSubmit={this.onSubmit}>
        <label>
          Select mode:
          {' '}
          <select value={this.props.mode} onChange={this.props.handleChangeMode}>
            {this.props.modes.map((name, index) => (
              <option key={index} value={index}>{name}</option>
            ))}
          </select>
        </label>
        <p>Use left and right arrows to control the car.</p>
        <p>Hitting a big cube will cause a game over.</p>
        <p>Hitting people in robocar mode lowers your score, try to avoid them.<br />
          Of course, in Carmageddon mode the more people you hit the more score you get.</p>
        <p className="game-controls__message">{this.props.message}{' '}</p>
        {this.state.gameWasStarted ? (
          <button className="game-controls__start" onClick={this.props.handleRestartGame}>Restart in {currentModeName} mode</button>
        ) : (
          <button className="game-controls__start" onClick={this.handleStartGame}>Start in {currentModeName} mode</button>
        )}
      </form>
    )
  }
}