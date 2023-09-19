class AppError extends Error{
    constructor(errmessage,errstatuscode){
        super(errmessage);

        this.status = `${errstatuscode}`.startsWith('4') ? 'fail' : 'error';
        this.statusCode = errstatuscode;
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports = AppError;