const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const locals = require("../config/locals");
const AppError = require("../util/AppError");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, locals.ACCESS_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, locals.REFRESH_SECRET, { expiresIn: "7d" });
};

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} data.accessToken Access token
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.checkPassword(password))) {
      return next(new AppError("Invalid username or password", 401));
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: locals.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      success: true,
      data: { accessToken },
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @api {post} /register Register
 * @apiName Register
 * @apiGroup Auth
 * @apiParam {String} username Username
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiParam {String} name Name
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    const user = new User({ username, email, password, name });
    await user.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful. You may login now.",
      });
  } catch (err) {
    next(err);
  }
};

/**
 * @api {post} /refresh Refresh token
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiParam {String} refreshToken Refresh token
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} data.accessToken Access token
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError("Unauthorized", 401));
    }
    jwt.verify(refreshToken, locals.REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return next(new AppError("Unauthorized", 401));
      }
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new AppError("Unauthorized", 401));
      }
      const accessToken = generateAccessToken(user);
      res.status(200).json({ success: true, data: { accessToken } });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @api {patch} /auth/change-password Change password
 * @apiName ChangePassword
 * @apiGroup Auth
 * @apiParam {String} password Current password
 * @apiParam {String} newPassword New password
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.changePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (!(await user.checkPassword(password))) {
      return next(new AppError("Invalid password", 400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    next(err);
  }
};

/**
 * @api {get} /auth/logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};

/**
 * @api {get} /auth/me Get authenticated user
 * @apiName Me
 * @apiGroup Auth
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User} data User data
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return next(new AppError("Unauthorized", 401));
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
