const path = require('path');
const fetch = require('node-fetch');
const base64 = require('base64-js');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const {Session, User} = require('../models/remixModels.js');

const authController = {};

authController.getJWT = (req, res, next) => {
  //check cookie for session
  console.log('getting JWT');
  if (req.cookies.ut) {
    console.log('JWT received', req.cookies.ut);
    res.locals.name = jwt.verify(req.cookies.ut, process.env.COOKIE_SECRET);
  } 
  // else, serve main logged-off page, page should have link to reddit auth
  next();
}

authController.getSession = (req, res, next) => {
  console.log("Getting session, checking for name from JWT");
  if (!res.locals.name) {
    console.log("no JWT found, redirecting to reddit auth");
    res.redirect('https://www.reddit.com/api/v1/authorize?client_id='
            + process.env.CLIENT_ID 
            + '&response_type=code&state='
            + process.env.STATE
            + '&redirect_uri='
            + process.env.REDIRECT_URI
            + '&duration=permanent&scope=history,identity');
  } else { // got username from JWT, check database for session token
    Session.findOne({name: res.locals.name})
    .then(async (data) => {
      if (data) {
        console.log("DB session found, authenticated session for:", res.locals.name);
        res.locals.token = data.token;
        res.locals.refresh_token = data.refresh_token;
        res.locals.expires_in = data.expires_in;
        if (Date.now() > data.expires_in) {
          console.log("Token ", res.locals.token, " expired, refreshing");
          await authController.refreshToken(req, res, next);
          console.log("Got session after refreshing token");
        }
        let userData = await User.findOne({name: res.locals.name}).exec();
        if (!userData) {
          console.log("creating new user");
          userData = User.create({name: res.locals.name});
        }
        res.locals.oldest_anchor = userData.oldest_anchor;
        res.locals.newest_anchor = userData.newest_anchor;
        res.locals.postList = userData.postList;
        console.log("Moving to next middleware");
        next();
      } else {
        res.locals.name = null;
        next();
      }
    })
    .catch((err) => {
      console.log('Error getting session: ', err);
    });
    // get reddit session token from db session collection
    // refresh token?
    // load dashboard, redirect to /dashboard? Or send index.html?
  }
}

authController.getNewToken = (req, res, next) => {
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
    res.locals.refresh_token = data.refresh_token;
    res.locals.expires_in = data.expires_in*1000 + Date.now() - 60000;
    getName(res.locals.token)
    .then(name => {
      res.locals.name = name;
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

authController.refreshToken = async (req, res, next) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', res.locals.refresh_token);
  fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {'Authorization': 'Basic ' + new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')},
    body: params 
  })
  .then(response => response.json())
  .then(async data => { 
    // data includes { 'access_token',  'token_type',  'expires_in',  'scope' }
    // store access_token in database session collection
    console.log('Refreshed token, new token is: ', data.access_token);
    res.locals.token = data.access_token;
    res.locals.expires_in = data.expires_in*1000 + Date.now() - 60000;
    await Session.findOneAndUpdate({name: res.locals.name}, 
                             { token: res.locals.token,
                               expires_in: res.locals.expires_in}).exec();
  })
  .catch((err) => {
    console.log("ERROR GETTING TOKEN");
    console.log("keys received", Object.keys(err))
    console.log('msg: ', err.message);
    console.log('error: ', err.error);
  });
}

authController.createSession = (req, res, next) => {
  // get name and token from res.locals
  // create and set JWT
  console.log("Creating session for", res.locals.name);
  if (res.locals.name) {
    let jwtToken = jwt.sign(res.locals.name, process.env.COOKIE_SECRET);
    Session.findOneAndUpdate({
      name: res.locals.name},
    {
      name: res.locals.name,
      token: res.locals.token,
      refresh_token: res.locals.refresh_token,
      expires_in: res.locals.expires_in
    },
    {upsert: true, new: true}).exec()
    .then( () => {
      res.cookie("ut", jwtToken);
      return next();
    })
    .catch((err) => {
      console.log('Error storing session: ', err);
    });
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

module.exports = authController;