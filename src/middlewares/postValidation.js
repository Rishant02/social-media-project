const { check } = require("express-validator");

module.exports.createPostValidation = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 120 })
    .trim(),
  check("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 3, max: 2000 })
    .trim(),
];

module.exports.updatePostValidation = [
  check("title")
    .optional()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be between 3 and 120 characters")
    .trim(),
  check("content")
    .notEmpty()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Content must be between 3 and 2000 characters")
    .trim(),
];
