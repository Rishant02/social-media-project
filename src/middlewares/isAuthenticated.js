const jwt = require("jsonwebtoken");
const locals = require("../config/locals");
const AppError = require("../util/AppError");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(" ")[1];
  if (!accessToken) {
    return next(new AppError("Unauthorized", 403));
  }
  jwt.verify(accessToken, locals.ACCESS_SECRET, async (err, decoded) => {
    if (err) {
      return next(new AppError("Unauthorized", 403));
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = isAuthenticated;
