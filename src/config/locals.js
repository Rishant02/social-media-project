module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  PORT: process.env.PORT || 3000,
};
