import React, { Component } from 'react';
import PostCard from './PostCard.jsx';

class PostsDisplay extends Component {
  constructor(props) {
    super(props);
    this.getAllPosts = this.getAllPosts.bind(this);
    this.getNewestPosts = this.getNewestPosts.bind(this);
    this.getOlderPosts = this.getOlderPosts.bind(this);
    this.state = {posts: [],
                  lastDisplayed: -1};
  }

  componentDidMount() {
    if (this.state.posts.length === 0) {
      this.getAllPosts()
      .then((numPosts) => {
        if(numPosts > 20) {
          this.setState({...this.state, lastDisplayed: numPosts - 20});
        }
      });
    }
  }

  getAllPosts() {
    let method = 'GET';
    return fetch('/api/upvoted/', {
      method,
      headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then((data) => {
      this.setState({posts: data});
      return data.length;
    })
    .catch(err => console.log('getAllPosts error: ', err));
  }

  getOlderPosts() {
    if (this.state.lastDisplayed > 0) {
      this.setState({...this.state, lastDisplayed: this.state.lastDisplayed - 20});
      return;
    }
    let method = 'GET';

    fetch('/api/next/20', {
      method,
      //body: JSON.stringify({ nickname: this.state.nickname }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then((data) => {
        //let newPosts = this.state.posts;
        let newPosts = data.concat(state.posts);
        //data.map((v) => newPosts.push(v));
        this.setState({posts: newPosts});
      })
      .catch(err => console.log('getOlderPosts error: ', err));
  };

  getNewestPosts() {
    let method = 'GET';
    
    fetch('/api/newest/20', {
      method,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then((data) => {
        //let newPosts = this.state.posts;
        //data.map((v) => newPosts.push(v));
        this.setState({posts: data});
      })
      .catch(err => console.log('getNewestPosts error: ', err));
  }

  render() {
    //for loops with PostCards
    let posts = [];
    // Adds posts reverse order, so newest are on top
    for (let i = this.state.posts.length - 1; i > this.state.lastDisplayed; i--) {
      posts.push(<PostCard key={'post' + i} 
                           title={this.state.posts[i].title} 
                           postUrl={this.state.posts[i].url}/>);
    }
    return (
      <div>
        <p>"HELLOOOO WORLD!"</p>
        {posts}
        <button type="button" onClick={this.getOlderPosts}>Get more posts</button>
      </div>
    );
  };
}

export default PostsDisplay;