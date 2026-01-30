const jwt = require('jsonwebtoken');

const generateAccessToken = (user)=>{
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
}
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
}

module.exports = { generateAccessToken, verifyAccessToken, generateRefreshToken };