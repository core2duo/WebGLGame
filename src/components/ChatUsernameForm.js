import React from 'react';
import PropTypes from 'prop-types';

export default class ChatUsernameForm extends React.Component {
  static propType = {
    handleSetUsername: PropTypes.func.isRequired,
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
    let username = this.state.value.trim();
    if (username) {
      this.props.handleSetUsername(username);
    }
  };

  render() {
    return (
      <form onSubmit={this.onSubmit} className="chat-form">
        <div className="chat-form__text">Choose a username to join the chat.</div>
        <div className="clearfix">
          <input autoFocus autoComplete="off" type="text" className="chat-form__input chat-form__input_text"
                 value={this.state.value} name="username" onChange={this.onChange}/>
          <input className="chat-form__input chat-form__input_button" type="submit" value="Join"/>
        </div>
      </form>
    )
  }
}