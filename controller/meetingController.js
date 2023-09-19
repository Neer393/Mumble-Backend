const Meeting = require('./../model/meetingModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsyncError');

exports.getMeeting = catchAsync(async(req,res,next)=>{
    const meetingId = req.params.meetid;
    const meeting = await Meeting.findOne({meetingId});
    if(!meeting){
        return res.status(400).json({
            status:'fail',
            message:'No such meeting exists'
        })
    }
    else    return res.status(200).json({
        status:'success',
        message:'Yes meeting exists'
    })
})

exports.createMeeting = catchAsync(async(req,res,next)=>{
    const meetingId = req.body.meetingId;
    const meeting = await Meeting.findOne({meetingId});
    if(!meeting){
        const newmeeting = await Meeting.create({meetingId});
        return res.status(200).json({
            status:'success',
            message:'New meeting created',
            newmeeting:meetingId
        });
    }
    else{
        return res.status(400).json({
            status:'fail',
            message:'Meeting already exists'
        });
    }
});