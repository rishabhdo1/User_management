const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 attempts per window per ip
    standardHeaders: true,
    legacyHeaders: false,
    message:{    message: 'Too many login attempts from this IP, please try again after 15 minutes'}
});

module.exports = { loginLimiter };