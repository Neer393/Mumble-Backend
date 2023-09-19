const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException',(err)=>{
    console.log('An uncaughtException occured..... Shutting down the server');
    console.log(err.name,err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app.js');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then(()=>console.log('DB connected successfully !!!'))
    .catch(err => console.log(err));

const port = process.env.PORT || 5000;

const server = app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
});

process.on('unhandledRejection',(err)=>{
    console.log('An unhandledRejection occured..... Shutting down the server');
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    });
});