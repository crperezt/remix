const mongoose = require('mongoose');

console.log("connecting to: ", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  // options for the connect method to parse the URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // sets the name of the DB that our collections are part of
  dbName: 'remix'
})
.then(()=>console.log('Connected to Mongo DB.'))
.catch(err=>console.log(err));

const Schema = mongoose.Schema;

// User Schema - stores info about reddit user and his/her upvotes
// name: reddit username
// postList: list of posts upvoted by user that we have gathered, along with user-provided tags
// first_anchor: earliest user post we have retrieved
// last_anchor: latest user post we have retrieved
const userSchema = new Schema({
  name: String,
  postList: [{
    postId: String,
    tags: [String]
    
  // }
    //   postId: [{
    //   type: Schema.Types.ObjectId,
    //   ref: 'redditPost'
    // }],
    // tags: [String]
  }],
  oldest_anchor: String,
  //  {
  //   // type of ObjectId makes this behave like a foreign key referencing the 'posts' collection
  //   type: Schema.Types.ObjectId,
  //   ref: 'redditPost'
  // },
  newest_anchor: String,
  // {
  //   // type of ObjectId makes this behave like a foreign key referencing the 'posts' collection
  //   type: Schema.Types.ObjectId,
  //   ref: 'redditPost'
  // }
});

const User = mongoose.model('user', userSchema);

// _uid: overwrites moongoose _uid, will be set to reddit fullname (uid) of post
// title: title of post on reddit
// url: url to post on reddit
// image_url: url to image, if any
const redditPostSchema = new Schema({
  postId: {type: String, index: true, unique: true},
  title: String,
  url: String,
  thumbnail: String,
  video: {
    fallback_url: String, 
    height: String, 
    width: String
  }
});

const RedditPost = mongoose.model('redditPost', redditPostSchema);

// user: foreign key to User collection
// token: refreshable token to access api info about user
const sessionSchema = new Schema({
  name: String,
  token: String,
  refresh_token: String,
  expires_in: Number
});

// creats a model for the 'species' collection that will be part of the export
const Session = mongoose.model('session', sessionSchema);


module.exports = {
  User,
  RedditPost,
  Session
};