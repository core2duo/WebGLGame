import React from 'react';
import PropType from 'prop-types';

import ChatMessageForm from './ChatMessageForm';
import ChatUsernameForm from './ChatUsernameForm';
import ChatMessages from './ChatMessages';
import ChatDisconnected from './ChatDisconnected';

import './Chat.css';

export default class Chat extends React.Component {
  static propTypes = {
    username: PropType.string.isRequired,
    messages: PropType.array.isRequired,
    connected: PropType.bool.isRequired,
    handleSetUsername: PropType.func.isRequired,
    handleSendMessage: PropType.func.isRequired,
    handleReconnect: PropType.func.isRequired,
  };

  render() {
    if (!this.props.connected) {
      return (
        <div className="chat">
          <ChatDisconnected handleReconnect={this.props.handleReconnect}/>
        </div>
      )
    }
    return (
      <div className="chat">
        {this.props.username ? (
          <ChatMessageForm handleSendMessage={this.props.handleSendMessage}/>
        ) : (
          <ChatUsernameForm handleSetUsername={this.props.handleSetUsername}/>
        )}
        <ChatMessages messages={this.props.messages}/>
      </div>
    )
  }
}