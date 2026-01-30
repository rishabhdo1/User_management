const db = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const logger = require('../logger/logger');
const {generateAccessToken,generateRefreshToken} = require('../services/generateToken');
const { sendSuccess } = require('../helpers/response');


const registerUser = async (req , res , next )=>{
        const {name , email, password} = req.body;

        if(!name || !email || !password){
            
            const err = new Error("All fields are required");//basic validation
            return next(err);
        }
  
let connection;

try {
  connection = await db.getConnection();
  await connection.beginTransaction();

  const [existing] = await connection.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    const err = new Error("User already exists");
    err.statusCode = 409;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await connection.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  await connection.commit();
  logger.info(`New user registered: ${email}`);
  res.status(201).json({ message: "User registered successfully" });

} catch (error) {
  if (connection) await connection.rollback();

    console.error('Registration error:', error.message);
  next(error);
} finally {
  if (connection) connection.release();
}

    };

    const loginUser = async (req , res , next )=>{
        const { email, password} = req.body;
        if(!email || !password){
            const err = new Error("All fields are required");
            return next(err);
        }
        try{
          const [rows] = await db.query(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            [email]
          );

          if(rows.length===0){
            return res.status(401).json({ message: "Invalid email or password" });
          }
          const user = rows[0];
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if(!isMatch){
            return res.status(401).json({ message: "Invalid email or password" });
          }
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);
          await db.query(
            "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [user.id, refreshToken]
          );
          logger.info(`User logged in: ${email}`);
          return sendSuccess(res,200,'Login successful',{accessToken,refreshToken});
        }catch(error){
          next(error);
        }
      }

    const refreshTokenHandler = async (req, res, next) => {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const [rows] = await db.query(
           "SELECT * FROM refresh_tokens WHERE user_id=? AND token=?",
          [decoded.id, refreshToken]
        );
                if (rows.length === 0) {
            logger.warn(`Invalid refresh token attempt for user ID: ${decoded.id}`);
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

      
    const [userRows] = await db.query(
      "SELECT id, email, role FROM users WHERE id = ?",
      [decoded.id]
    );
     if (userRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const user = userRows[0];

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.json({ accessToken, refreshToken });
      } catch (error) {
        next(error);
      }
    };
    
    const logoutUser = async (req , res , next )=>{
        const { refreshToken } = req.body;
        try{
            await db.query(
                "DELETE FROM refresh_tokens WHERE token = ?",
                [refreshToken]
            );
         
            res.json({ message: "Logout successful" });
        }catch(error){
            next(error);
        }
    }
    module.exports = {registerUser, loginUser, logoutUser, refreshTokenHandler};