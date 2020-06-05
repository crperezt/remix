import React, { Component } from 'react';
import PostCard from './PostCard.jsx';

const STEP = 20;

class PostsDisplay extends Component {
  constructor(props) {
    super(props);

    this.getAllPosts = this.getAllPosts.bind(this);
    this.getNewestPosts = this.getNewestPosts.bind(this);
    this.getOlderPosts = this.getOlderPosts.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.addTag = this.addTag.bind(this);
    this.state = {posts: [],
                  lastDisplayed: -1,
                  showModal: false};
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
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

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  getAllPosts() {
    let method = 'GET';
    return fetch('/api/upvoted/', {
      method,
      headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then((data) => {
      this.setState({posts: data.posts, lastDisplayed: -1});
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

  addTag(e) {
    let method = 'POST';
    let postId = e.target.id;
    postId = postId.slice(3);
    
    fetch('/api/tag/' + postId, {
      method,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((data) => {
        //let newPosts = this.state.posts;
        //data.map((v) => newPosts.push(v));
        this.setState({posts: data.posts});
      })
      .catch(err => console.log('getNewestPosts error: ', err));
  }

  handleScroll(e) {
    console.log("handling scroll");
    console.log("scrollHeight", document.body.scrollHeight);
    console.log("scrollTop", document.body.scrollTop);
    console.log("clientHeight", document.body.clientHeight);
    const bottom = document.body.scrollHeight - document.body.scrollTop ===document.body.clientHeight;
    if (bottom) this.getOlderPosts();
  }

  showTagModal(e) {
    let postId = e.target.id;
    postId = postId.slice(3);
    setState({...this.state, showModal: true});
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
      let newImageUrl = this.state.posts[i].thumbnail;
      if (newImageUrl === 'default' || newImageUrl === 'self') {
        newImageUrl = '/assets/snoo.png';
      }
      posts.push(<PostCard key={'post' + i} 
                           title={this.state.posts[i].title} 
                           postUrl={this.state.posts[i].url}
                           imageUrl={newImageUrl}
                           postId={this.state.posts[i].postId}
                           tags={this.state.posts[i].tags}
                           addTag={this.addTag}/>);
    }
    return (
      <div onScroll={this.handleScroll}>
      <a className="morePosts" href="" onClick={this.getNewestPosts}>Get latest posts</a>
      <div className="displayDiv">
        {posts}
      </div>
      </div>

    );
  };
}

{/* </div>
      <button type="button" onClick={this.getOlderPosts}>Get more posts</button>
      </div> */}
export default PostsDisplay;