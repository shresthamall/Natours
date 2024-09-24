const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');

// Helper functions
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  let i = 0;
  Object.entries(obj).forEach((entry) => {
    if (allowedFields.includes(entry[0])) newObj[entry[0]] = entry[1];
    console.log(i, newObj);
    i++;
  });
  return newObj;
};

// Handlers
exports.getAllUsers = catchAsync(async function (req, res) {
  // Execute query
  const users = await User.find();
  // Send response
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: users.length, data: { users } });
});

exports.updateMe = catchAsync(async function (req, res, next) {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for updating password. Please use /updateMyPassword',
        StatusCodes.BAD_REQUEST
      )
    );
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  console.log('ID: ', req.body);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // 3) Send response
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
  });
});
exports.getUser = function (req, res, next) {};
exports.createUser = function (req, res, next) {};
exports.updateUser = function (req, res, next) {};
exports.deleteUser = function (req, res, next) {};
