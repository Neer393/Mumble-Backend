const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a name']
    },
    email:{
        type:String,
        required:[true,'A user must have an email address'],
        unique:[true,'This email is already registered'],
        validate:[function(el){
            return validator.isEmail(el);
        },'Please provide a valid email address']
    },
    photo:{
        type:String,
        default:'user.png'
    },
    password:{
        type:String,
        required:[true,'Please provide password'],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'A user must confirm password'],
        validate:[function(el){
            return el === this.password;
        },'Password and Confirming Password must match']
    },
    passwordChangedAt:Date,
    passwordResetToken: String,
    passwordResetTokenExpires : Date
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))    return next();
    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew)  return next();
    this.passwordChangedAt = Date.now()-1000;
    next();
});

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires=Date.now()+10*60*1000;
    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;