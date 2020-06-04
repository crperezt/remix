import React, { Component } from 'react';
import PostCard from './PostCard.jsx';

const STEP = 20;

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
    console.log('componentDidMount ran');
    if (this.state.posts.length === 0) {
      this.getAllPosts()
      .then((numPosts) => {
        if(numPosts > STEP) {
          this.setState({...this.state, lastDisplayed: STEP - 1});
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
      this.setState({posts: data.posts});
      return data.posts ? data.posts.length : 0;
    })
    .catch(err => console.log('getAllPosts error: ', err));
  }

  getOlderPosts() {
    console.log('getting older posts...');
    console.log("state is: ", this.state.posts);
    console.log("lastDisplayed is: ", this.state.lastDisplayed);
    if (this.state.lastDisplayed + STEP < this.state.posts.length) {
      console.log('not fetching...')
      this.setState({...this.state, lastDisplayed: this.state.lastDisplayed + STEP});
      return;
    }
    let method = 'GET';
    console.log('fetching...');
    fetch('/api/next/' + STEP, {
      method,
      //body: JSON.stringify({ nickname: this.state.nickname }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then((data) => {
        //let newPosts = this.state.posts;
        //let newPosts = data.posts.concat(this.state.posts);
        //data.map((v) => newPosts.push(v));
        this.setState({posts: data.posts, lastDisplayed: this.state.lastDisplayed + STEP});
      })
      .catch(err => console.log('getOlderPosts error: ', err));
  };

  getNewestPosts() {
    let method = 'GET';
    
    fetch('/api/newest/' + STEP, {
      method,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then((data) => {
        //let newPosts = this.state.posts;
        //data.map((v) => newPosts.push(v));
        this.setState({posts: data.posts});
      })
      .catch(err => console.log('getNewestPosts error: ', err));
  }

  render() {
    //for loops with PostCards
    let posts = [];
    console.log("rendering...");
    console.log("state is: ", this.state.posts);
    console.log("lastDisplayed is: ", this.state.lastDisplayed);
    // Adds posts reverse order, so newest are on top
    //for (let i = this.state.posts.length - 1; i > this.state.lastDisplayed; i--) {
      for (let i = 0; i < Math.min(this.state.lastDisplayed + 1, this.state.posts.length); i++) {
      posts.push(<PostCard key={'post' + i} 
                           title={this.state.posts[i].title} 
                           postUrl={this.state.posts[i].url}
                           imageUrl={this.state.posts[i].thumbnail}
                           postId={this.state.posts[i].postId}/>);
    }
    return (
      <div>
      <button type="button" onClick={this.getNewestPosts}>Get latest posts</button>
      <div className="displayDiv">
        {posts}
      </div>
      <button type="button" onClick={this.getOlderPosts}>Get more posts</button>
      </div>
    );
  };
}

export default PostsDisplay;