const express = require('express');
const remixController = require('../controllers/remixController.js');
const router = express.Router();

router.use('/', remixController.getToken); //, (req, res, next) => console.log(res.locals.upvoted));

module.exports = router;