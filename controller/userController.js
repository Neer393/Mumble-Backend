const catchAsync = require('../utils/catchAsyncError');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const User = require('./../model/userModel');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/emailer');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else{
        cb(new AppError('Please select an image file',400),false);
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

const filterObj = (ogObj,...filters)=>{
    const newobj = {};
    Object.keys(ogObj).forEach(el =>{
        if(filters.includes(el))    newobj[el]=ogObj[el];
    });
    return newobj;
}

exports.updatePassword = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    if(!user || !(await bcrypt.compare(req.body.currPassword,user.password))){
        return next(new AppError('Invalid Credentials',401));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    sendToken(user,201,res);
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeImage = catchAsync(async(req,res,next)=>{
    if(!req.file)   return next();
    req.file.filename = `user-${req.user.id}.jpeg`;

    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/${req.file.filename}`);
    next();
})

exports.updateDetails = catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This route is not for password update',400));
    }
    const filteredBody = filterObj(req.body,'name','email');
    if(req.file)    filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user,filteredBody,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'success',
        updatedUser
    });
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
    const {password,confirmPassword} = req.body;
    const email = req.user.email;
    const id = req.user.id;
    const user = await User.findById(req.user.id).select('+password');
    if(!password || !confirmPassword || password!==confirmPassword || !user ||!(await bcrypt.compare(password,user.password)))   return next(new AppError('Invalid Credentials',400));

    await User.findByIdAndDelete(req.user.id);
    fs.unlink(`public/user-${id}.jpeg`,(err)=>{
        if(err) console.log(err);
    });
    //On only in production
    await sendEmail({
        email,
        subject: 'Alert! Account Deleted',
        message:'This mail is just a confirmatory mail stating the closure of the Mumble account. It\'s difficult to see you go :('
    });
    res.status(200).json({
        status:'success',
        message:'Account deleted Successfully'
    });
});

exports.getMe = catchAsync(async(req,res,next)=>{
    res.download('./public/user.png'); 
})

exports.isloggedin = (req,res)=>{
    res.status(200).json({
        status:true,
        user:req.user
    });
}

