const db = require("../config/database");
const { getCache, setCache, deleteCache } = require("../services/cacheService");


const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}`;

    // Try to get from cache first
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
      console.log(`Cache HIT for user:${userId}`);
      return res.json({
        success: true,
        source: 'cache', // Helpful for debugging
        data: cachedUser
      });
    }

    console.log(`Cache MISS for user:${userId}, querying database`);

    // If not in cache, query database
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const user = rows[0];

    // Store in cache for 5 minutes (300 seconds)
    await setCache(cacheKey, user, 300);

    res.json({
      success: true,
      source: 'database',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    next(error);
  }
};

/**
 * Update current user's profile
 */
const updateMe = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const userId = req.user.id;

    // Validation
    if (!email && !name) {
      return res.status(400).json({
        success: false,
        message: "At least one field (email or name) is required"
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    values.push(userId); // For WHERE clause

    // Check if email already exists (if updating email)
    if (email) {
      const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user"
        });
      }
    }

    // Update user
    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // IMPORTANT: Invalidate cache after update
    const cacheKey = `user:${userId}`;
    await deleteCache(cacheKey);
    console.log(`Cache invalidated for user:${userId}`);

    res.json({ 
      success: true,
      message: "User updated successfully" 
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    next(error);
  }
};

/**
 * Delete current user's account
 */
const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete user's refresh tokens first (foreign key constraint)
    await db.query(
      "DELETE FROM refresh_tokens WHERE user_id = ?", 
      [userId]
    );

    // Delete user
    await db.query(
      "DELETE FROM users WHERE id = ?", 
      [userId]
    );

    // Invalidate cache
    const cacheKey = `user:${userId}`;
    await deleteCache(cacheKey);
    console.log(`Cache invalidated for deleted user:${userId}`);

    res.json({ 
      success: true,
      message: "User account deleted successfully" 
    });
  } catch (error) {
    console.error('Delete user error:', error.message);
    next(error);
  }
};

module.exports = { 
  getMe, 
  updateMe, 
  deleteMe 
};