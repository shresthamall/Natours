const { StatusCodes } = require('http-status-codes');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create(req.body);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
