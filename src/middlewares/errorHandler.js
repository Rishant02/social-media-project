const mongoose = require("mongoose");
const locals = require("../config/locals");

const ErrorHandler = (err, req, res, next) => {
  const errStatus = err.statusCode || 500;
  const errMessage = err.message || "Internal Server Error";
  let errors, fields, code;

  // Mongoose Validation Error
  if (
    err.name === "ValidationError" &&
    err instanceof mongoose.Error.ValidationError
  ) {
    errors = Object.values(err.errors).map((el) => el?.message);
    fields = Object.values(err.errors).map((el) => el.path);
    code = 400;

    const formattedErrors = errors.join(", ");
    return res.status(code).json({
      success: false,
      message: formattedErrors,
      fields,
      ...(locals.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000 && err.keyPattern) {
    fields = Object.keys(err.keyPattern);
    code = 409;
    return res.status(code).json({
      success: false,
      message: `document with that ${fields.join(", ")} already exists`,
      fields,
      ...(locals.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Mongoose Cast Error
  if (err.name === "CastError") {
    code = 400;
    return res.status(code).json({
      success: false,
      message: `Invalid ${err.path}`,
      ...(locals.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Other Mongoose Errors
  if (err.name === "VersionError" || err.name === "OverwriteModelError") {
    code = 409;
    return res.status(code).json({
      success: false,
      message: "Document has been modified. Please try again.",
      ...(locals.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Express Errors
  return res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMessage,
    ...(locals.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = ErrorHandler;
