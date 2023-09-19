const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const meetingRoutes = require('./routes/meetingRoutes');
const globalErrorHandler = require('./controller/errorController');

const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(xss());
app.use(cors({
    origin: 'https://mumble-neer393.netlify.app/',
    credentials: true,
}));
app.use(mongoSanitize());

app.use('/public',express.static('public'));

app.use('/',userRoutes);
app.use('/auth',authRoutes);
app.use('/token',tokenRoutes);
app.use('/meeting',meetingRoutes);

app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on the server !!!`,404));
});
app.use(globalErrorHandler);

module.exports=app;
