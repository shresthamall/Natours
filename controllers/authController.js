const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const APPError = require('./../utils/appError');

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

// Authenticate user login
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
