const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    meetingId:{
        type:String,
        required:[true,'A meeting should have a meeting ID']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    expiresAt:{
        type:Date,
        default: Date.now()+30*24*60*60*1000
    }
});

const Meeting = mongoose.model('Meeting',meetingSchema);
module.exports = Meeting;