import React from 'react';
import PropTypes from 'prop-types';

import './GameRenderer.css';

export default class GameRenderer extends React.Component {
  static propTypes = {
    game: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.props.game.init(this.canvas3d, this.canvasUI);
  }

  // We should be available to click through UI to focus game canvas
  handleClick = (e) => {
    e.stopPropagation();
    this.canvas3d.focus();
  };

  render() {
    return (
      <div className="game-renderer">
        <canvas tabIndex={0} className="game-renderer__canvas game-renderer__canvas_3d" width={this.props.width}
                height={this.props.height} ref={(canvas) => this.canvas3d = canvas}/>
        <canvas className="game-renderer__canvas game-renderer__canvas_ui" width={this.props.width}
                height={this.props.height} ref={(canvas) => this.canvasUI = canvas} onClick={this.handleClick}/>
      </div>
    )
  }
}