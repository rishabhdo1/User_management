const db = require("../config/database");
const redisClient = require("../config/redis");
const logger = require("../logger/logger"); 

const getUsersPaginated = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const cacheKey = `users:page=${page}:limit=${limit}`;

    console.log("CACHE KEY USED:", cacheKey);

    const cachedData = await redisClient.get(cacheKey);
    console.log("CACHED BEFORE SET:", cachedData);

    if (cachedData) {
      console.log("🟢 Served from Redis cache");
      logger.info(`Served users page ${page} from cache`);
      return res.json(JSON.parse(cachedData));
    }

    console.log("🔵 Served from MySQL DB");

    const [countRows] = await db.execute("SELECT COUNT(*) as total FROM users");
    const total = countRows[0].total;

    const query = `SELECT id, name, email, role FROM users LIMIT ${limit} OFFSET ${offset}`;
    const [users] = await db.query(query);

    const responseData = {
      page,
      limit,
      users,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 });

    const cachedAfterSet = await redisClient.get(cacheKey);
    logger.info("CACHED AFTER SET:", cachedAfterSet);

    return res.json(responseData);
  } catch (error) {
    next(error);
  }
};
const getUserById = async (req , res , next) => {
    try{
        const userId = req.params.id;
        const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        if(!rows.length){
            return res.status(404).json({message : "User not found"});
        }
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
}

    const deleteUserByAdmin = async (req, res, next) => {
  await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
  res.json({ message: "User deleted" });
};

    
module.exports = {
    getUsersPaginated,
    getUserById,
    deleteUserByAdmin
}