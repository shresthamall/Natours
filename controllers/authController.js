const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const APPError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// Sign token and return new token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Verify JWT, promisify and return promise
const verify = (token) => {
  return promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

// Create password reset url to be sent to user via email
const createPasswordResetURL = (req, resetToken) => {
  return `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
};

// Create password reset message to be sent to user via email
const createPasswordResetMessage = (resetURL) => {
  return `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. 
    If you didn't forget your password, please ignore this email!`;
};

exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // TODO: passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // Create JWT
  const token = signToken(newUser._id);

  // send response
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password)
    return next(
      new APPError(
        'Please provide email and password!',
        StatusCodes.BAD_REQUEST
      )
    );

  // 2) Check if user exists && password is correct
  // .select('+password'): use + before field name to select a field that is not selected by default
  const user = await User.findOne({ email }).select('+password');
  // user.password is the hashed password saved in DB and password is user input password actual
  if (!user || !(await user.correctPassword(password, user.password))) {
    const error = new APPError(
      'Incorrect email or password',
      StatusCodes.UNAUTHORIZED
    );
    return next(error);
  }

  // 3) If everything is ok, send token
  const token = signToken(user._id);
  res.status(StatusCodes.OK).json({
    status: 'success',
    token,
  });
});

// Middleware: Authenticate user login
exports.protect = catchAsync(async function (req, res, next) {
  let token;
  const { headers } = req;
  // 1) Get token and check if it exists
  if (!headers.authorization || !headers.authorization.startsWith('Bearer'))
    return next(
      new APPError(
        'You are not logged in, please login to access this resource!',
        StatusCodes.UNAUTHORIZED
      )
    );

  token = headers.authorization.split(' ')[1];

  // 2) Validate the token - Verification
  const decoded = await verify(token);
  //   console.log(decoded);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new APPError(
        'This user belonging to this token no longer exists!',
        StatusCodes.UNAUTHORIZED
      )
    );
  // 4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new APPError(
        'User has recemtly changed password, please login again!',
        StatusCodes.UNAUTHORIZED
      )
    );
  // 5) Grant access to protected route
  req.user = currentUser;
  next();
});

// Middleware: Restrict access to users with specified roles
exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    // req.user is set in protect() above
    if (!roles.includes(req.user.role))
      return next(
        new APPError(
          'You do not have permission to perform this action.',
          StatusCodes.FORBIDDEN
        )
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  // 1) Get the user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  console.log('user found: ', user);
  if (!user)
    return next(
      new APPError('No user was found with that email', StatusCodes.NOT_FOUND)
    );
  // 2) Create a password reset token

  const resetToken = user.createPasswordResetToken();
  console.log('resetToken: ', resetToken);
  // Save the file but not run validators: Email and password are not provided
  await user.save({ validateBeforeSave: false });

  console.log('document saved');

  // 3) Send token back to user
  const resetURL = createPasswordResetURL(req, resetToken);

  const message = createPasswordResetMessage(resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for next 10 minutes)',
      text: message,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Password reset token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new APPError(
        'There was an error sending the email. Try again later!',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user)
    return next(
      new APPError('Token is invalid or has expired', StatusCodes.BAD_REQUEST)
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update passwordChangedAt property for the user

  // 4)Log the user in and JWT
  const token = signToken(user._id);
  res.status(StatusCodes.OK).json({
    status: 'success',
    token,
  });
});
// 0f9b1264f66f03fb44362b005ea2dac0d99117f9432e8be87297dcad3273cf4a
