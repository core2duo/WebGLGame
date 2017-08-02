import React from 'react';
import PropType from 'prop-types';

import './ChatForm.css';

export default class ChatMessageForm extends React.Component {
  static propTypes = {
    handleSendMessage: PropType.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: '',
    }
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value
    })
  };

  onSubmit = (e) => {
    e.preventDefault();
    let message = this.state.value.trim();
    if (message) {
      this.props.handleSendMessage(message);
      this.setState({
        value: ''
      })
    }
  };

  render() {
    return (
      <form onSubmit={this.onSubmit} className="chat-form">
        <div className="chat-form__text">Type something!</div>
        <div className="clearfix">
          <input autoFocus autoComplete="off" type="text" className="chat-form__input chat-form__input_text"
                 value={this.state.value} name="message" onChange={this.onChange}/>
          <input className="chat-form__input chat-form__input_button" type="submit" value="Send"/>
        </div>
      </form>
    )
  }
}