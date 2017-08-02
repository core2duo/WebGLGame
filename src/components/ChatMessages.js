import React from 'react';
import PropType from 'prop-types';

import './ChatMessages.css';

export default class ChatMessages extends React.Component {
  static propTypes = {
    messages: PropType.array.isRequired,
  };

  render() {
    return <ul className="chat-messages">
      {this.props.messages.map(message => (
        <li className="chat-messages__message" key={message.id}>
          <span className="chat-messages__username">{message.username}:</span>{' '}
          <span className="chat-messages__text">{message.text}</span>
        </li>
      ))}
    </ul>
  }
}
