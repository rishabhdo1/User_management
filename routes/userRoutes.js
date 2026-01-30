const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware");
const { getMe,updateMe,deleteMe } = require("../controllers/userController");
const { getUsersPaginated,getUserById,deleteUserByAdmin } = require("../controllers/adminController");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);
router.get("/admin", protect, getUsersPaginated);
router.get("/admin/users/:id", protect, getUserById);
router.delete("/admin/users/:id", protect, deleteUserByAdmin);


module.exports = router;
