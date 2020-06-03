const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { User, RedditPost } = require('../models/remixModels.js')

const remixController = {};

remixController.getNewestUpvoted = (req, res, next) => {
  let userAgent = 'web:remixapp:v1.0.0 (by /u/remixapp)';
  const params = new URLSearchParams();
  let limit = req.params.num ? req.params.num : 50;
  params.append('limit', limit);
  console.log('fetching upvotes data')
  fetch('https://oauth.reddit.com/user/' + res.locals.name + '/upvoted/?limit=' + limit, {

  //fetch('https://oauth.reddit.com/user/' + name + '/upvoted/', {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + res.locals.token,
              'User-Agent': process.env.USER_AGENT},
  //  body: params
  })
  .then( response => response.json())
  .then( (response) => {
    console.log('UPVOTES: ', response.data.children);
    let newPosts = [];
    let newPostList = [];
    for (let v of response.data.children) {
      let fallback_url = null;
      let height = null;
      let width = null;
      if (v.data.media) {
        fallback_url = v.data.media.reddit_video.feedback_url;
        height = v.data.media.reddit_video.height;
        width = v.data.media.reddit_video.width;
      }
      newPosts.push({
        _id: v.data.name,
        title: v.data.title,
        url: v.data.url,
        thumbnail: v.data.thumbnail,
        video: {
          fallback_url: fallback_url,
          height: height, 
          width: height
        }
      });
      newPostList.push({
        postId: v.data.name,
      });
    }
    
    RedditPost.insertMany(newPosts, {ordered: true})
    .catch((err) => {return;} )
    .then(() => {
      User.findOne({name: res.locals.name}).exec()
      .then((user) => {
        if(user) {
          newPostList = newPostList.concat(user.postList);
        }
        return user;
      })
      .then((user) => {
        let newest_anchor;
        if (user && user.newest_anchor) {
          newest_anchor = user.newest_anchor;
        } else {
          newest_anchor = response.data.after;
        }
        User.findOneAndUpdate(
          {name: res.locals.name}, 
          {postList: newPostList, 
            oldest_anchor: response.data.children[0].data.name,
            newest_anchor: newest_anchor},
            {upsert: true}
        ).exec();
      });
    })
  })
  .catch((err) => {
    console.log("ERROR GETTING UPVOTE INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
  });
}

module.exports = remixController;