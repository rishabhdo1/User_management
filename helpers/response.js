const sendSuccess =(res , statusCode , message , data = null) => {
    return res.status(statusCode).json({
        status: 'true',
        message,
        data: data
    });
}

const sendError = (res , statusCode , message, errors= []) => {
    return res.status(statusCode).json({
        status: 'false',
        message,
        errors
    });
}
module.exports = {  
    sendSuccess,
    sendError
}