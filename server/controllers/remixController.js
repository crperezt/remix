const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const remixController = {};


remixController.getName= (req, res, next) => {
  console.log("got token: ", token);
  //let username;
  let userAgent = 'web:remixapp:v1.0.0 (by /u/remixapp)';

  fetch('https://oauth.reddit.com/api/v1/me', {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + token,
              'User-Agent': userAgent}
  })
  .then(response => response.json())
  .then((data) => {
    username = data.name;
    getUpvoted(token, username);
  })
  .catch((err) => {
    console.log("ERROR GETTING USER INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
  });
}


remixController.getUpvoted = (req, res, next) => {
  let userAgent = 'web:remixapp:v1.0.0 (by /u/remixapp)';
  const params = new URLSearchParams();
  params.append('limit', 50);
  fetch('https://oauth.reddit.com/user/' + name + '/upvoted/?limit=3', {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + token,
              'User-Agent': userAgent},
    //body: params
  })
  .then(response => response.json())
  .then((data) => {
    console.log('UPVOTES: ', data);
  })
  .catch((err) => {
    console.log("ERROR GETTING UPVOTE INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
  });
}



module.exports = remixController;