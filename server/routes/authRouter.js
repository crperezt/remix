const express = require('express');
const authController = require('../controllers/authController.js');
const router = express.Router();


router.use('/', authController.getNewToken, authController.createSession, (req, res, next) => {
  console.log('redirecting to root level')
  res.redirect(302,'/');
});

module.exports = router;