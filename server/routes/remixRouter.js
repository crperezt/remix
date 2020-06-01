const express = require('express');
const remixController = require('../controllers/remixController.js');
const router = express.Router();

router.use('/', remixController.getUpvoted); //, (req, res, next) => console.log(res.locals.upvoted));

module.exports = router;