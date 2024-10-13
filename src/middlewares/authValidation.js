// authValidation.ts
const { check } = require("express-validator");

// Validation rules for user registration
module.exports.registerValidation = [
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  check("password")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain at least one special character"),
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 120 })
    .trim(),
];

// Validation rules for user login
module.exports.loginValidation = [
  check("username").notEmpty().withMessage("Username is required").trim(),
  check("password").notEmpty().withMessage("Password is required"),
];

module.exports.changePasswordValidation = [
  check("password").notEmpty().withMessage("Password is required"),
  check("newPassword")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain at least one special character"),
];
