const authController = require('./../controller/authController');
const userController = require('./../controller/userController');
const express = require('express');

const router = express.Router();

router
    .route('/updatePassword')
    .patch(authController.protect,userController.updatePassword);

router
    .route('/updateMe')
    .patch(authController.protect,userController.uploadUserPhoto,userController.resizeImage,userController.updateDetails);

router
    .route('/deleteMe')
    .delete(authController.protect,userController.deleteMe);

router
    .route('/getMe')
    .get(userController.getMe);

router
    .route('/isloggedin')
    .get(authController.protect,userController.isloggedin)
module.exports = router;

