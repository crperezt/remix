import React, { Component } from 'react';
import PostsDisplay from './PostsDisplay.jsx';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="mainContainer">
        <PostsDisplay/>
      </div>
    );
  };
}

export default App;