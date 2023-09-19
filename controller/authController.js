const catchAsync = require('./../utils/catchAsyncError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {promisify} = require('util');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/emailer.js');

const sendToken = (user,statuscode,res)=>{
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
    res.cookie('jwt',token,{
        expires:new Date(Date.now()+30*24*60*60*1000),
        httpOnly:true
    });
    user.password = undefined;
    res.status(statuscode).json({
        status:'success',
        token,
        user
    });
}

exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    else{
        return next(new AppError('Please Log In again',401));
    }
    const decodedData = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    const freshUser = await User.findById(decodedData.id);

    if(!freshUser){
        return next(new AppError('The token belonging to the user does not exist',401));
    }
    
    if(freshUser.passwordChangedAt){
        const chngdtimestamp = parseInt(freshUser.passwordChangedAt.getTime()/1000);
        if(decodedData.iat < chngdtimestamp){
            return next(new AppError('User recently changed password. Please Log in again',401));
        }
    }
    req.user = freshUser;
    next();
});

exports.isLoggedIn = (req,res,next)=>{
    res.status(200).json({
        status:'success',
        loggedIn:true
    });
}

exports.login = catchAsync(async(req,res,next)=>{
    const {email,password} =req.body;
    if(!email || !password){
        return next(new AppError('Either email or password is missing',404));
    }
    const searchUser = await User.findOne({email}).select('+password');
    if(!searchUser || !(await bcrypt.compare(password,searchUser.password))){
        return next(new AppError('Invalid Credentials',404));
    }
    sendToken(searchUser,200,res);
});

exports.signup = catchAsync(async(req,res,next)=>{
    const newUser = await User.create(req.body);
    //On only in production
    await sendEmail({
        email:req.body.email,
        subject: 'Welcome to Mumble Family',
        message:'Hooray!! You are now an official member of the Mumble community. Create a meeting and chat with your friends,family and colleagues'
    })
    sendToken(newUser,200,res);
});

exports.logout = (req,res)=>{
    res.cookie('jwt',undefined,{
        expires:new Date(Date.now()+1),
        httpOnly:true
    });
    res.status(200).json({
        status:'success',
        message:'Logged out successfully'
    })
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    const email = req.body.email;
    const dbUser = await User.findOne({email});
    if(!dbUser){
        return next(new AppError('No user with this email address found',404));
    }

    const resetToken = dbUser.createPasswordResetToken();
    await dbUser.save({validateBeforeSave:false});

    const reseturl = `${req.protocol}://${req.get('host')}/auth/resetPassword/${resetToken}`;
    const msg = `Forgot Your Password ? Do not Worry. We got your back. Click this link to reset password : ${reseturl}`;

    try{
        await sendEmail({
            email:dbUser.email,
            subject:'Your Password Reset Token. Valid for Only 10 mins',
            message:msg
        });
        res.status(200).json({
            status:'success',
            message:'Token sent successfully'
        });
    }
    catch(err){
        dbUser.passwordResetToken = undefined;
        dbUser.passwordResetTokenExpires=undefined;
        dbUser.save({validateBeforeSave:false});
        console.log(err);
        return next(new AppError('Error sending mail. Try again Later',500));
    }
});

exports.resetPassword = catchAsync(async(req,res,next)=>{
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken:hashedToken,passwordResetTokenExpires:{$gt:Date.now()}});

    if(!user){
        return next(new AppError('Either the token is invalid or has expired',400));
    }
    user.password = req.body.password;
    user.confirmPassword  =req.body.confirmPassword;
    user.passwordResetToken=undefined;
    user.passwordResetTokenExpires=undefined;
    await user.save();

    sendToken(user,200,res);
});