const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { User, RedditPost } = require('../models/remixModels.js');

const remixController = {};

remixController.getOlderUpvoted = (req, res, next) => {
  res.locals.getOlder = true;
  next();
};

remixController.get__Upvoted = (req, res, next) => {
  res.locals.getOlder = true;
  next();
};

// Gets posts that were upvoted after the last post
// collected for the user so far
remixController.getNewestUpvoted = (req, res, next) => {
  let newPostList = [];
  let newPosts = [];
  const params = new URLSearchParams();
  let limit = req.params.num ? req.params.num : 100;
  params.append('limit', limit);
  console.log('fetching upvotes data');

  let fetchUrl = 'https://oauth.reddit.com/user/' + res.locals.name
  + '/upvoted/?limit=' + limit;
  if (res.locals.newest_anchor) {
    fetchUrl += '&after=' + res.locals.newest_anchor;
  }
  fetch(fetchUrl, {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + res.locals.token,
              'User-Agent': process.env.USER_AGENT},
  })
  .then(response => response.json())
  .then( (response) => {
    //console.log('UPVOTES: ', response.data.children);
    if (!response.data.children) {
      console.log("No new posts");
      return next();
    }

    for (let v of response.data.children) {
      let fallback_url = null;
      let height = null;
      let width = null;
      if (v.data.media && v.data.media.reddit_video) {
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
    
    //Insert new posts to RedditPosts collection
    RedditPost.insertMany(newPosts, {ordered: true})
    .catch((err) => {return;} )
    .then(() => {
      // Update User postList with new posts
      User.findOne({name: res.locals.name}).exec()
      .then((user) => {
        if(user) {
          newPostList.reverse();
          newPostList = newPostList.concat(user.postList);
        }
        return user;
      })
      .then((user) => {
        let oldest_anchor = user.oldest_anchor ? 
                            user.oldest_anchor : 
                            newPostList[newPosts.length - 1].name;
        User.findOneAndUpdate(
          {name: res.locals.name}, 
          {postList: newPostList, 
            oldest_anchor: oldest_anchor,
            newest_anchor: newPosts[0].name},
            {upsert: true}
        ).exec();
      });
    })
  })
  .then(() => res.json(newPosts.reverse()))
  .catch((err) => {
    console.log("ERROR GETTING UPVOTE INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.type);
  });
}; // getNewestUpvoted() ends here

// returns all user upvoted posts collected so far
remixController.getUserUpvoted = async (req, res, next) => {
  let userData = await User.findOne({name: res.locals.name}).exec();
  if (!userData) {
    console.log("No data for user found");
    return res.sendStatus(418);
  }
  const postsList = [];
  userData.postList.forEach((v) => {
    postsList.push(v.postId);
  });
  let posts = await RedditPost.find({_id: { $in: postsList}});
  res.json(posts);
};

module.exports = remixController;