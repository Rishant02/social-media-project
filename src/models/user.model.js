const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email."],
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      maxLength: 20,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: 3,
      maxlength: 120,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 200,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    avatar: {
      type: String,
      validate: [validator.isURL, "Please provide a valid URL."],
      default:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compares the given plain text password to the user's hashed password
 *
 * @param {String} plainPassword - The plain text password to compare
 * @returns {Promise<Boolean>} - Whether the passwords match
 */
userSchema.methods.checkPassword = async function (plainPassword) {
  const isMatch = await bcrypt.compare(plainPassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
