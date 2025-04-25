const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const factory = require('./handlerFactory');

// Helper functions
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// Handlers

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

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

exports.createUser = function (req, res, next) {};
// No routes implemented for this
exports.getUser = factory.getOne(User);

// Get all users
exports.getAllUsers = factory.getAll(User);

// Reserved for users with 'admin' roles
// DO NOT USE THIS TO UPDATE PASSWORDS, WILL NOT RUN SAFETY MIDDLEWARES
exports.updateUser = factory.updateOne(User);
// WILL DELETE USER FROM DB
exports.deleteUser = factory.deleteOne(User);
