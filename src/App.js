import React, { Component } from 'react';

import ChatContainer from './containers/ChatContainer';
import Game from './components/Game';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app-container clearfix">
        <Game />
        <ChatContainer />
      </div>
    )
  }
}

export default App;
