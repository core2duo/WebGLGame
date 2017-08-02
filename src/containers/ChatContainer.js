import React from 'react';

import Chat from '../components/Chat';

export default class ChatContainer extends React.Component {
  ws = null;

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      username: '',
      connected: false,
    };
  }

  componentDidMount() {
    this.initWebsocket();
  }

  componentWillUnmount() {
    this.ws.close();
  }

  initWebsocket() {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      return;
    }
    this.ws = new WebSocket(process.env.REACT_APP_WS_SERVER);
    this.ws.onopen = this.onWebsocketOpen;
    this.ws.onmessage = this.onWebsocketMessage;
    this.ws.onclose = this.onWebsocketClose;
  }

  onWebsocketOpen = () => {
    this.setState({
      messages: [],
      connected: true,
    });
  };

  onWebsocketMessage = (e) => {
    this.setState({
      messages: [JSON.parse(e.data)].concat(this.state.messages)
    });
  };

  onWebsocketClose = () => {
    this.setState({
      connected: false,
    });
  };

  reconnect = () => {
    this.initWebsocket();
  };

  send = (message_text) => {
    let message = {
      username: this.state.username,
      text: message_text,
    };

    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  setUsername = (username) => {
    this.setState({
      username: username
    })
  };

  render() {
    return <Chat connected={this.state.connected} username={this.state.username} messages={this.state.messages}
                 handleSetUsername={this.setUsername} handleSendMessage={this.send} handleReconnect={this.reconnect}/>;
  }
}