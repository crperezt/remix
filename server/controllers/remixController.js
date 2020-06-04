const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { User, RedditPost } = require('../models/remixModels.js');

const remixController = {};

remixController.getOlderUpvoted = (req, res, next) => {
  console.log('getting older posts');
  res.locals.getOlder = true;
  res.locals.getNewest = false;
  remixController.getUpvoted(req, res, next);
};

remixController.getNewestUpvoted = (req, res, next) => {
  console.log('getting newer posts');
  res.locals.getNewest = true;
  res.locals.getOlder = false;
  remixController.getUpvoted(req, res, next);
};

// Gets posts that were upvoted after the last post
// collected for the user so far
remixController.getUpvoted = (req, res, next) => {
  console.log("connecting to reddit api");
  let newPostList = [];
  let newPosts = [];
  const params = new URLSearchParams();
  let limit = req.params.num ? req.params.num : 100;
  params.append('limit', limit);
  console.log('fetching upvotes data');

  let fetchUrl = 'https://oauth.reddit.com/user/' + res.locals.name
  + '/upvoted/?limit=' + limit;
  if (res.locals.getNewest && res.locals.newest_anchor) {
    fetchUrl += '&before=' + res.locals.newest_anchor;
  } else if (res.locals.getOlder && res.locals.oldest_anchor) {
    fetchUrl += '&after=' + res.locals.oldest_anchor;
  }
  //TEST REMOVE
  //fetchUrl = 'https://oauth.reddit.com/user/remixapp/upvoted/?limit=5&before=t3_gw5an9'
  console.log('fetch url: ', fetchUrl);
  fetch(fetchUrl, {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + res.locals.token,
              'User-Agent': process.env.USER_AGENT},
  })
  .then(response => response.json())
  .then( (response) => {
    //console.log('UPVOTES: ', response.data.children);
    console.log('Got upvotes')//, res.data.children.length)
    if (!response.data || !response.data.children) {
      console.log("No more posts");
      return res.status(418).json("we fresh outta posts");
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
        postId: v.data.name,
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
    console.log("got from server: ", newPostList);
    
    //Insert new posts to RedditPosts collection
    RedditPost.insertMany(newPosts, {ordered: true})
    .catch((err) => {
      console.log('error inserting to RedditPost, dup key inserted');
      return;
    })
    .then(() => {
      // Update User postList with new posts
      User.findOne({name: res.locals.name}).exec()
      .then((user) => {
        if(user && res.locals.getNewest) {
          console.log('adding newest to user doc:');
          //new to old 
          //newPostList.reverse();
          // 
          newPostList = newPostList.concat(user.postList);
        } else if (user && res.locals.getOlder){
          console.log('adding older to user doc:');
          //db list + new reddit data (newest to oldest)
          newPostList = user.postList.concat(newPostList);   
        } else {
          console.log('adding ?? to user doc:');
          //newPostList.reverse();
          newPostList = newPostList.concat(user.postList);
        }
        console.log('newPostList is: ', newPostList);
        return user;
      })
      .then((user) => {
        // let oldest_anchor = user.oldest_anchor ? 
        //                     user.oldest_anchor : 
        //                     newPostList[newPosts.length - 1].name;
        let oldest_anchor = newPostList[newPostList.length - 1].postId;
        let newest_anchor = newPostList[0].postId;
        console.log('setting oldest_anchor:', oldest_anchor);
        console.log('setting newest_anchor:', newest_anchor);
        User.findOneAndUpdate(
          {name: res.locals.name}, 
          {postList: newPostList, 
            oldest_anchor: oldest_anchor,
            newest_anchor: newest_anchor},
            {upsert: true}
        ).exec()
        .then(next());
      });
    })
  })
  //.then(() => res.json(newPosts.reverse()))
  .catch((err) => {
    console.log("ERROR GETTING UPVOTE INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.type);
  });
}; // getNewestUpvoted() ends here

// returns all user upvoted posts collected so far
remixController.getCachedUpvoted = async (req, res, next) => {
  let userData = await User.findOne({name: res.locals.name}).exec();
  if (!userData) {
    console.log("No data for user found");
    return res.status(418).json("no user data found");
  }
  const postsList = [];
  userData.postList.forEach((v) => {
    postsList.push(v.postId);
  });
  console.log("Finding postsList in RedditPost:", postsList);
  // let posts = await RedditPost.find({postId: { $in: postsList}});
  

  let query = [
    {$match: {postId: {$in: postsList}}},
    {$addFields: {"__order": {$indexOfArray: [postsList, "$postId" ]}}},
    {$sort: {"__order": 1}}
   ];
   let posts = await RedditPost.aggregate(query);
   console.log("Sending client: ", posts);
  res.json({posts: posts});
};

module.exports = remixController;