const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const sessionController = {};

sessionController.getJWT = (req, res, next) => {
  //check cookie for session
  console.log('getting JWT');
  if (req.cookies.ut) {
    console.log('JWT received', req.cookies.ut);
    res.locals.userId = jwt.verify(req.cookies.ut, process.env.COOKIE_SECRET);
  } 
  // else, serve main logged-off page, page should have link to reddit auth
  next();
}

sessionController.getSession = (req, res, next) => {
  console.log("checking for userId");
  if (!res.locals.userId) {
    console.log("no JWT found, redirecting to reddit auth");
    res.redirect('https://www.reddit.com/api/v1/authorize?client_id='
            + process.env.CLIENT_ID 
            + '&response_type=code&state='
            + process.env.STATE
            + '&redirect_uri='
            + process.env.REDIRECT_URI
            + '&duration=permanent&scope=history,identity');
  } else {
    console.log("Authenticated session for:", res.locals.userId);
    // get reddit session token from db session collection
    // refresh token?
    // load dashboard, redirect to /dashboard? Or send index.html?
  }
}

sessionController.getNewToken = (req, res, next) => {
  console.log('received redirect request, retrieving token');
  if (req.query.state !== process.env.STATE) {
    console.log('diff state');
    next({
      log: 'Error in state',
      message: 'Error: state different, potential MiM attack?'
    });
  }

  const params = new URLSearchParams();
  params.append('code', req.query.code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', process.env.REDIRECT_URI);

  fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {'Authorization': 'Basic ' + new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')},
    //headers: {'Authorization': 'Basic ' + new Buffer('pE6HnyBUJuDYDQ:).toString('base64')},
    body: params 
  })
  .then(response => response.json())
  .then(data => { 
    // data includes { 'access_token',  'token_type',  'expires_in',  'refresh_token',  'scope' }
    // store access_token in database session collection
    console.log('Got token', data.access_token);
    res.locals.token = data.access_token;
    getName(res.locals.token)
    .then(name => {
      res.locals.userId = name
      next();
    });
  })
  .catch((err) => {
    console.log("ERROR GETTING TOKEN");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
    
  });
}

sessionController.createSession = (req, res, next) => {
  // get userId and token from res.locals
  // create and set JWT
  console.log("Creating session for", res.locals.userId);
  if (res.locals.userId) {
    let jwtToken = jwt.sign(res.locals.userId, process.env.COOKIE_SECRET);
    //res.cookies['ut'] = jwtToken;
    res.cookie("ut", jwtToken)
    return next();
  }
}

function getName(token) {
  console.log("got token: ", token);
  return fetch('https://oauth.reddit.com/api/v1/me', {
    method: 'GET',
    headers: {'Authorization': 'bearer ' + token,
              'User-Agent': process.env.USER_AGENT}
  })
  .then(response => response.json())
  .then((data) => {
    return data.name;
  })
  .catch((err) => {
    console.log("ERROR GETTING USER INFO");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
    return(err);
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

module.exports = sessionController;