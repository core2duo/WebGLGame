import React from 'react';
import PropType from 'prop-types';

import './ChatDisconnected.css';

export default class ChatDisconnected extends React.Component {
  static propTypes = {
    handleReconnect: PropType.func.isRequired,
  };

  render() {
    return (
      <div className="chat-disconnected">
        <div className="chat-disconnected__text">Chat is disconnected :( You can try to join it manually.</div>
        <button className="chat-disconnected__button" onClick={this.props.handleReconnect}>Reconnect</button>
      </div>
    )
  }
}