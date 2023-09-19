const express = require('express');
const meetingController = require('./../controller/meetingController.js');

const routes=express.Router();

routes
    .route('/:meetid')
    .get(meetingController.getMeeting);

routes
    .route('/')
    .post(meetingController.createMeeting);

module.exports=routes;