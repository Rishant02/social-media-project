const Post = require("../models/post.model");
const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const AppError = require("../util/AppError");

/**
 * @api {get} /api/posts Get all posts for the authenticated user
 * @apiName getAllPosts
 * @apiGroup Posts
 * @apiDescription Retrieves all posts for the authenticated user.
 * @apiParam {Number} [page=1] Page number to retrieve.
 * @apiParam {Number} [limit=10] Number of posts per page.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object[]} data The list of posts.
 * @apiSuccess {Number} count Total number of posts.
 * @apiSuccess {Number} page The page number retrieved.
 * @apiSuccess {Number} totalPages Total number of pages available.
 */
module.exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Retrieve posts for the authenticated user
    const [posts, count] = await Promise.all([
      Post.find({ author: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Post.countDocuments({ author: req.userId }),
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
 * @api {get} /api/posts/:id Get a specific post
 * @apiName getPost
 * @apiGroup Posts
 * @apiDescription Retrieves a specific post.
 * @apiParam {String} id The ID of the post to retrieve.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The requested post.
 */
module.exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author", "-password")
      .populate("likedBy", "-password");
    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {post} /api/posts Create a post
 * @apiName createPost
 * @apiGroup Posts
 * @apiDescription Creates a new post.
 * @apiParam {String} title The title of the post.
 * @apiParam {String} content The content of the post.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The created post.
 */
module.exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.userId,
    });
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { posts: post._id },
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /api/posts/:id Update a post
 * @apiName updatePost
 * @apiGroup Posts
 * @apiDescription Updates a post.
 * @apiParam {String} id The id of the post to update.
 * @apiParam {String} title The title of the post.
 * @apiParam {String} content The content of the post.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The updated post.
 */
module.exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    if (post.author.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to update this post", 401)
      );
    }
    const updatedPost = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {delete} /api/posts/:id Delete a post
 * @apiName deletePost
 * @apiGroup Posts
 * @apiDescription Deletes a post.
 * @apiParam {String} id The id of the post to delete.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The deleted post.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    if (post.author.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to delete this post", 401)
      );
    }
    await post.deleteOne();
    await User.findByIdAndUpdate(req.userId, {
      $pull: { posts: post._id },
    });
    await Comment.deleteMany({ post: post._id });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /api/posts/:id/toggle-like Toggle like post
 * @apiName toggleLikePost
 * @apiGroup Posts
 * @apiDescription Toggles like on a post.
 * @apiParam {String} id The id of the post to toggle like.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The updated post.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.toggleLikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    // Check if the user has already liked the post
    const hasLiked = post.likedBy.includes(req.userId);

    if (hasLiked) {
      post.likedBy.pull(req.userId);
    } else {
      post.likedBy.push(req.userId);
    }
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
      message: `Like ${hasLiked ? "removed" : "added"}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /api/posts/:id/comment Get comments for a post
 * @apiName getPostComments
 * @apiGroup Posts
 * @apiDescription Retrieves comments for a post.
 * @apiParam {String} id The id of the post.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Array<Object>} data The comments for the post.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.getPostComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ post: id })
      .populate("author", "-password")
      .populate("likedBy", "-password");
    if (!comments) {
      return next(new AppError("Post not found", 404));
    }
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {post} /api/posts/:id/comment Create a comment
 * @apiName createComment
 * @apiGroup Posts
 * @apiDescription Creates a new comment.
 * @apiParam {String} id The id of the post to comment on.
 * @apiParam {String} content The content of the comment.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The created comment.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.createComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.create({
      ...req.body,
      author: req.userId,
      post: id,
    });
    await Post.findByIdAndUpdate(id, {
      $addToSet: { comments: comment._id },
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {delete} /api/posts/:id/comment/:commentId Delete a comment
 * @apiName deleteComment
 * @apiGroup Posts
 * @apiDescription Deletes a comment.
 * @apiParam {String} id The id of the post the comment is on.
 * @apiParam {String} commentId The id of the comment to delete.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The deleted comment.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    const comment = await Comment.findById(commentId);
    if (!comment || !post) {
      return next(new AppError("Comment not found", 404));
    }
    if (comment.author.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to update this comment", 401)
      );
    }
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /api/posts/:id/comment/:commentId Update a comment
 * @apiName updateComment
 * @apiGroup Posts
 * @apiDescription Updates a comment.
 * @apiParam {String} id The id of the post the comment is on.
 * @apiParam {String} commentId The id of the comment to update.
 * @apiBody {String} content The updated comment content.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The updated comment.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new AppError("Comment not found", 404));
    }
    if (comment.author.toString() !== req.userId) {
      return next(
        new AppError("You are not authorized to update this comment", 401)
      );
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json({ success: true, data: updatedComment });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {patch} /api/posts/:id/comment/:commentId/toggle-like Toggle like comment
 * @apiName toggleLikeComment
 * @apiGroup Posts
 * @apiDescription Toggles like on a comment.
 * @apiParam {String} id The id of the post the comment is on.
 * @apiParam {String} commentId The id of the comment to toggle like.
 * @apiSuccess {Boolean} success Whether the request was successful.
 * @apiSuccess {Object} data The updated comment.
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
module.exports.toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new AppError("Comment not found", 404));
    }
    // Check if the user has already liked the comment
    const hasLiked = comment.likedBy.includes(req.userId);

    if (hasLiked) {
      comment.likedBy.pull(req.userId);
    } else {
      comment.likedBy.push(req.userId);
    }
    await comment.save();

    res
      .status(200)
      .json({
        success: true,
        data: comment,
        message: `Like ${hasLiked ? "removed" : "added"}`,
      });
  } catch (error) {
    next(error);
  }
};
