const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');

const remixController = {};


function getName(token) {
  console.log("got token: ", token);
  let username;
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


function getUpvoted(token, name) {
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

remixController.loginUser = (req, res, next) => {
  // https://www.reddit.com/api/v1/authorize?client_id=pE6HnyBUJuDYDQ&response_type=code&state=elestado&redirect_uri=http://localhost:8080/remix&duration=permanent&scope=history
}

remixController.getToken = (req, res, next) => {

  if (req.query.state !== 'elestado') {
    console.log('diff state');
    next({
      log: 'Error in state',
      message: 'Error: state different, potential MiM attack?'
    });
  }

  const params = new URLSearchParams();
  params.append('code', req.query.code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', 'http://localhost:8080/remix');

  fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {'Authorization': 'Basic ' + new Buffer('pE6HnyBUJuDYDQ:NCrMAEYEduRuTWLK8ZpYVMtA69c').toString('base64')},
    body: params 
  })
  .then(response => response.json())
  .then(data => { 
    // data includes { 'access_token',  'token_type',  'expires_in',  'refresh_token',  'scope' }
    getName(data.access_token)
  })
  .catch((err) => {
    console.log("ERROR GETTING TOKEN");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
  });
}

/*
// Can be used to encode object into URI string, e.g., 'param1=abc&param2=def'
function urlEncode(data) {
  let out = [];

  for (let key in data) {
    out.push(`${key}=${encodeURIComponent(data[key])}`);
  }

  return out.join('&')
}
*/

module.exports = remixController;