const redis = require("../config/redis");

// Get cache
exports.getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("Cache parse error:", err.message);
        return null; // fallback to DB
    }
};

// Set cache with TTL (seconds)
exports.setCache = async (key, value, ttl = 300) => {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
};

// Delete cache
exports.deleteCache = async (key) => {
    await redis.del(key);
};