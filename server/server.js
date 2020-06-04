const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 3000;

const apiRouter = require('./routes/apiRouter.js');
const authRouter = require('./routes/authRouter.js')
const authController = require('./controllers/authController.js')


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/assets', express.static(path.resolve(__dirname, '../client/assets')));
console.log('dirname is: ', __dirname);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

//app.use('/login', authController.getSession, (req, res, next) => {res.redirect('/')});
app.use('/login', (req, res, next) => {res.sendFile(path.resolve(__dirname, '..'))});

if(process.env.NODE_ENV !== 'development') {
  // statically serve everything in the build folder on the route '/build'
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on the route '/'
  // app.get('/', (req, res) => {
  //   res.sendFile(path.join(__dirname, '../index.html'));
  // });
}

// Checks for JWT and session, the re-routes to /auth
app.use('/', authController.getJWT, authController.getSession, (req, res, next) => {
  if (res.locals.name) {
    // probably send username here as well?
    console.log("Sending index.html");
    // Switch to this when react front-end is plugged in
    //res.sendFile(path.join(__dirname, '../client/index.html'));
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    console.log("sending login.html")
    res.sendFile(path.join(__dirname, '../client/login.html'));
  }
});




// authorization URL for client to grant us access to reddit account:
// https://www.reddit.com/api/v1/authorize?client_id=pE6HnyBUJuDYDQ&response_type=code&state=elestado&redirect_uri=http://localhost:8080/remix&duration=permanent&scope=history




app.use((req, res, next) => {
  res.sendStatus(404);
  //throw new Error('this is testing the global error handler')
  console.log('404 handler triggered')
  //next('error testing it out');
})

/**
 * configire express global error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
 */
// eslint-disable-next-line no-unused-vars

app.use((err, req, res, next) => {
  let defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' }, 
  };
  let errorObj = Object.assign(defaultErr, err);
  console.log('Global error handler: ', errorObj.log);
  console.log('sending error status: ', errorObj.status);
  console.log('sending error msg: ', errorObj.message);
  return res.sendStatus(errorObj.status);
});


app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;