const express = require('express');
const sessionController = require('../controllers/sessionController.js');
const router = express.Router();


router.use('/', sessionController.getNewToken, sessionController.createSession, (req, res, next) => {
  console.log('redirecting to root level')
  res.redirect(302,'/');
});

module.exports = router;