const express = require('express');
const tokenController = require('./../controller/tokenController.js');
const authController = require('./../controller/authController.js');

const router = express.Router();

router
    .route('/generatetoken')
    .get(authController.protect,tokenController.generatetoken);

module.exports = router;