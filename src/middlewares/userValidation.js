const { check } = require("express-validator");

module.exports.updateUserValidation = [
  check("name")
    .optional()
    .isLength({ min: 3, max: 120 })
    .withMessage("Name must be between 3 and 120 characters")
    .trim(),
  check("bio")
    .optional()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Bio must be between 3 and 2000 characters")
    .trim(),
];
