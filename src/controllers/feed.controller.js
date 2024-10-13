const Post = require("../models/post.model");
const User = require("../models/user.model");

/**
 * @api {get} /api/feed Get user feed
 * @apiName getFeed
 * @apiGroup Feed
 * @apiDescription Retrieves the posts of the users the authenticated user is friends with.
 * @apiParam {Number} [page=1] Page number to retrieve.
 * @apiParam {Number} [limit=10] Number of posts per page.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object[]} data The list of posts.
 * @apiSuccess {Number} count Total number of posts.
 * @apiSuccess {Number} page The page number retrieved.
 * @apiSuccess {Number} totalPages Total number of pages available.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Find the user and check if user exists
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const [posts, count] = await Promise.all([
      Post.find({ author: { $in: user.friends } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "-password")
        .exec(),
      Post.countDocuments({ author: { $in: user.friends } }),
    ]);
    res.status(200).json({
      success: true,
      data: posts,
      count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /api/feed/friend-comment Get feed of friends' comments
 * @apiName getFriendCommentFeed
 * @apiGroup Feed
 * @apiDescription Retrieves posts that friends have commented on.
 * @apiParam {Number} [page=1] Page number to retrieve.
 * @apiParam {Number} [limit=10] Number of posts per page.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object[]} data The list of posts.
 * @apiSuccess {Number} count Total number of posts.
 * @apiSuccess {Number} page The page number retrieved.
 * @apiSuccess {Number} totalPages Total number of pages available.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getFriendCommentFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;
    const user = await User.findById(req.userId);

    // Find the user and check if user exists
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const pipeline = [
      {
        // match where author is not a friend
        $match: { author: { $nin: user.friends } },
      },
      {
        // populating comments
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
      {
        $unwind: "$comments",
      },
      {
        // match posts that have comments by friends
        $match: { "comments.author": { $in: user.friends } },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          content: { $first: "$content" },
          author: { $first: "$author" },
          createdAt: { $first: "$createdAt" },
          comments: { $push: "$comments" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        // populating author
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          "author.password": 0,
        },
      },
    ];

    // Aggregation pipeline to count total matching posts
    const countPipeline = [
      {
        $match: { author: { $nin: user.friends } },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
      {
        $unwind: "$comments",
      },
      {
        $match: { "comments.author": { $in: user.friends } },
      },
      {
        $group: {
          _id: "$_id",
        },
      },
      {
        $count: "totalCount",
      },
    ];

    const [posts, countResult] = await Promise.all([
      Post.aggregate(pipeline),
      Post.aggregate(countPipeline),
    ]);

    const count = countResult[0]?.totalCount || 0;

    res.status(200).json({
      success: true,
      data: posts,
      count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /api/feed/friend-liked Get posts liked by friends
 * @apiName getFriendLikedPosts
 * @apiGroup Feed
 * @apiDescription Retrieves posts liked by friends that the user is not friends with.
 * @apiParam {Number} [page=1] Page number to retrieve.
 * @apiParam {Number} [limit=10] Number of posts per page.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object[]} data The list of posts.
 * @apiSuccess {Number} count Total number of posts.
 * @apiSuccess {Number} page The page number retrieved.
 * @apiSuccess {Number} totalPages Total number of pages available.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getFriendLikedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;
    const user = await User.findById(req.userId);

    // Find the user and check if user exists
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const query = {
      likedBy: { $in: user.friends },
      author: { $nin: user.friends },
    };
    const [posts, count] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "-password")
        .exec(),
      Post.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      data: posts,
      count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};
