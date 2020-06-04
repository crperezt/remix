const express = require('express');
const remixController = require('../controllers/remixController.js');
const authController = require('../controllers/authController.js');
const router = express.Router();

router.use('/next/:num',  authController.getJWT, 
                          authController.getSession,
                          remixController.getOlderUpvoted,
                          remixController.getCachedUpvoted); 

router.use('/newest/:num',  authController.getJWT, 
                            authController.getSession, 
                            remixController.getNewestUpvoted,
                            remixController.getCachedUpvoted);

router.use('/upvoted/', authController.getJWT, 
                        authController.getSession, 
                        remixController.getCachedUpvoted);

router.post('/tag/:postId', authController.getJWT, 
                            authController.getSession, 
                            remixController.tagPost);

module.exports = router;