const express = require('express')

const router = express.Router();

const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../schemas/authSchemas');

const {registerUser,loginUser,refreshTokenHandler,logoutUser} = require('../controllers/authController')

const { loginLimiter } = require('../middlewares/rateLimiter');

const { protect } = require('../middlewares/authMiddleware');


router.post('/register', validate(registerSchema), registerUser);
router.post('/login', loginLimiter, validate(loginSchema), loginUser);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout',logoutUser, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Protected route example
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile accessed",
    user: req.user
  });
});

module.exports = router;