const User = require("../models/user.model");
const FriendRequest = require("../models/friendRequest.model");
const AppError = require("../util/AppError");

/**
 * @api {get} /requests Get friend requests
 * @apiName GetFriendRequests
 * @apiGroup Friend
 * @apiDescription Retrieves the list of friend requests sent to the user.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {FriendRequest[]} data The list of friend requests.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getFriendRequests = async (req, res, next) => {
  try {
    const friendRequests = await FriendRequest.find({
      receiver: req.userId.toObjectId(),
      status: "pending",
    }).populate("sender", "-password");
    res.status(200).json({ success: true, data: friendRequests });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {post} /requests Send a friend request
 * @apiName SendFriendRequest
 * @apiGroup Friend
 * @apiDescription Sends a friend request to the user with the given id.
 * @apiParam {String} reciever The id of the user to send the friend request to.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {FriendRequest} data The created friend request.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */

module.exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { receiver } = req.body;
    if (!receiver) {
      return next(new AppError("Reciever not found", 404));
    }
    if (receiver === req.userId) {
      return next(
        new AppError("You cannot send a friend request to yourself", 400)
      );
    }
    const user = await User.findById(req.userId);
    if (user.friends.includes(receiver)) {
      return next(new AppError("You are already friends", 400));
    }
    const friendRequest = await FriendRequest.create({
      sender: user.id,
      receiver,
    });
    res.status(201).json({
      success: true,
      data: friendRequest,
      mesage: "Friend request sent",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /requests/:id/accept Accept a friend request
 * @apiName AcceptFriendRequest
 * @apiGroup Friend
 * @apiDescription Accepts a friend request sent by another user.
 * @apiParam {String} id The id of the friend request to accept.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {FriendRequest} data The accepted friend request.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findByIdAndUpdate(
      id,
      {
        status: "accepted",
      },
      {
        new: true,
      }
    );
    if (!friendRequest) {
      return next(new AppError("Friend request not found", 404));
    }
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });
    res.status(200).json({
      success: true,
      data: friendRequest,
      message: "Accepted friend request",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /requests/:id/reject Reject a friend request
 * @apiName RejectFriendRequest
 * @apiGroup Friend
 * @apiDescription Rejects a friend request sent by another user.
 * @apiParam {String} id The id of the friend request to reject.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {FriendRequest} data The rejected friend request.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findByIdAndUpdate(
      id,
      {
        status: "rejected",
      },
      {
        new: true,
      }
    );
    if (!friendRequest) {
      return next(new AppError("Friend request not found", 404));
    }
    res.status(200).json({
      success: true,
      data: friendRequest,
      message: "Rejected friend request",
    });
  } catch (error) {
    next(error);
  }
};
