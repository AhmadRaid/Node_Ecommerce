const express = require("express");
var jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { promisify } = require("util");
const AppError = require("../utils/AppError");

const singToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_Secret_Key, {
    expiresIn: "1d",
  });
};

const singRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_Refresh_Secret_Key, {
    expiresIn: "2d",
  });
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => console.log(err));
  };
};

exports.singUp = async (req, res) => {
  let user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(user, 200, res);
};


exports.Login = catchAsync(async (req, res ,next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json("Please Provide email and password");
  }
  const user = await User.findOne({ email });
console.log(user.password);
  if (!user || !(await user.correctPassword(password , user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // its secure in production enough because in localhost or development the https its not support so the encryption its not define or we can read it .
  if (process.env.NODE_ENV == "production") optionCookie.secure = true;

  // Changed to let keyword
  let newRefreshTokenArray = !cookies?.jwt
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
    /* 
    Scenario added here: 
        1) User logs in but never uses RT and does not logout 
        2) RT is stolen
        3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
    */
    const refreshToken = cookies.jwt;
    const foundToken = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundToken) {
      console.log("attempted refresh token reuse at login!");
      // clear out ALL previous refresh tokens
      newRefreshTokenArray = [];
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  }

  const accessToken = singToken(user._id);
  const newRefreshToken = singRefreshToken(user._id);
  const optionCookie = {
    expires: new Date(Date.now() + 9000),
    httpOnly: true,
  };

  // Saving refreshToken with current user
  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  const result = await user.save();

  // Creates Secure Cookie with refresh token
  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    accessToken,
    newRefreshToken,
  });
});

exports.protectAuth = (req, res, next) => {
  console.log(req.cookies.jwt);

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401).json({
      status: "You are not logged in! Please log in to get access.",
    });
  }
  const decode = promisify(jwt.verify)(token, process.env.JWT_Secret_Key);

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = async function (req, res) {
  const hashedToken = crypto
    .createHash("sha1")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token is invalid or has expired" });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return res.status(400).json({ message: "done" });
};

exports.refresh = async (req, res) => {
  if (req.cookies.jwt) {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwt;

    res.clearCookie(jwt, { httpOnly: true, sameSite: "None", secure: true });

    const user = await User.findOne({ refreshToken }).exec();

    //detected refresh token reuse !
    if (!user) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, data) => {
          if (err) res.status(403).json({ message: "Unauthorized" });
          const hackedUser = await User.findOne({ _id: data._id }).exec();
          hackedUser.refreshToken = [];
          await hackedUser.save();
        }
      );
    }

    const newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

    // Verifying refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log("expired refresh token");
          user.refreshToken = [...newRefreshTokenArray];
          const result = await user.save();
          console.log(result);
        }
        if (err || user.name !== decoded.name) return res.status(403);

        const accessToken = singToken(user._id);
        const newRefreshToken = singRefreshToken(user._id);
        const optionCookie = {
          expires: new Date(Date.now() + 9000),
          httpOnly: true,
        };

        // Saving refreshToken with current user
        User.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await user.save();

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          accessToken,
          newRefreshToken,
        });
      }
    );
  } else {
    return res.status(406).json({ message: "Unauthorized" });
  }
};

exports.logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const user = await User.findOne({ refreshToken }).exec();
  if (!user) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
  const result = await user.save();
  console.log(result);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.status(204);
};
