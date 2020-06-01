const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 8080;

const redditState = "kek4rv89yBHJVD5YRT569HJNhkj"
const redSecret = "NCrMAEYEduRuTWLK8ZpYVMtA69c";

const remixRouter = require('./routes/remixRouter.js');
const sessionRouter = require('./routes/sessionRouter.js')
const sessionController = require('./controllers/sessionController.js')


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.use('/remix', remixRouter);
app.use('/auth', sessionRouter);

app.use('/', sessionController.getJWT, sessionController.getSession); //, (req, res, next) => console.log(res.locals.upvoted));


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