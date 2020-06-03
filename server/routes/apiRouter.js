const express = require('express');
const remixController = require('../controllers/remixController.js');
const authController = require('../controllers/authController.js');
const router = express.Router();

router.use('/next/:num', remixController.getNewestUpvoted); //, (req, res, next) => console.log(res.locals.upvoted));
router.use('/newest/:num',  authController.getJWT, 
                            authController.getSession, 
                            remixController.getNewestUpvoted, 
                            (req, res, next) => res.sendStatus(200));

module.exports = router;