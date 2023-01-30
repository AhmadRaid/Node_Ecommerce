const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The field is required MR Ahmad"],
    maxlength: [20, "name can not be more than 20 characters"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "The field is required MR Ahmad"],
  },
  image: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
   // select: false,
  },
  refreshToken: [String],
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  console.log('asdddddddddddddddddddddddddd')
   next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  // this original resetToken without any encryption
  const resetToken = crypto.randomBytes(32).toString("hex");

  // this resetToken encryption thats store in DB and its encrypted because if any hacker hack the db cant reset the password as a real user
  this.passwordResetToken = crypto
    .createHash("sha1")
    .update(resetToken)
    .digest("hex");

  // this is expire of this resetToken its after create it 10 minute , if we use it after 10 minute its must be not valid to reset token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
