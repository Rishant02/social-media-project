const Post = require("../models/post.model");
const User = require("../models/user.model");
const FriendRequest = require("../models/friendRequest.model");
const Comment = require("../models/comment.model");
const AppError = require("../util/AppError");

/**
 * @api {get} /users Get users
 * @apiName GetUser
 * @apiGroup User
 * @apiParam {String} search Search term
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User[]} data User data
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const users = await User.find({
      _id: { $ne: req.userId },
      name: { $regex: search ?? "", $options: "i" },
    }).select("-password");
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /users/:id Get user
 * @apiName GetUserById
 * @apiGroup User
 * @apiParam {String} id User id
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User} data User data
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").populate("posts");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /users/:id Update user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiParam {String} id User id
 * @apiBody {Object} data User data
 * @apiBody {String} name User name
 * @apiBody {String} bio User bio
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User} data User data
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user._id.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to update this user", 403)
      );
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    }).select("-password");
    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {delete} /users/:id Delete user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiParam {String} id User id
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user._id.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to delete this user", 403)
      );
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return next(new AppError("User not found", 404));
    }
    // Removing user's posts, likes, comments, and friends
    await Post.deleteMany({ author: user._id });
    await Post.updateMany({}, { $pull: { likedBy: user._id } });
    await User.updateMany({}, { $pull: { friends: user._id } });
    await FriendRequest.deleteMany({
      $or: [{ sender: user._id }, { receiver: user._id }],
    });
    await Comment.deleteMany({ author: user._id });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
/**
 * @api {get} /users/:id/friends Get user friends
 * @apiName GetUserFriends
 * @apiGroup User
 * @apiParam {String} id User id
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User[]} data User data
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate("friends", "-password")
      .select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({ success: true, data: user.friends });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {delete} /users/:id/unfriend Unfriend user
 * @apiName Unfriend
 * @apiGroup User
 * @apiParam {String} id User id
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {User} data User data
 * @apiSuccess {String} message Success message
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.unfriend = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $pull: { friends: id },
      },
      {
        new: true,
      }
    );
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    await User.findByIdAndUpdate(id, {
      $pull: { friends: user._id },
    });
    res
      .status(200)
      .json({ success: true, data: user, message: "Unfriended successfully" });
  } catch (error) {
    next(error);
  }
};
