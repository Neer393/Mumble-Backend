const express = require('express');
const authController = require('./../controller/authController.js');

const routes=express.Router();

routes
    .route('/login')
    .post(authController.login);

routes
    .route('/logout')
    .get(authController.protect,authController.logout);

routes
    .route('/signup')
    .post(authController.signup);

routes
    .route('/forgotPassword')
    .post(authController.forgotPassword);

routes
    .route('/resetPassword/:token')
    .post(authController.resetPassword);

routes
    .route('/loggedIn')
    .get(authController.protect,authController.isLoggedIn);

module.exports = routes;