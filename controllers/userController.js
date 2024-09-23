const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');

// Handlers
exports.getAllUsers = catchAsync(async function (req, res) {
  // Execute query
  const users = await User.find();
  // Send response
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: users.length, data: { users } });
});
exports.getUser = function (req, res) {};
exports.createUser = function (req, res) {};
exports.updateUser = function (req, res) {};
exports.deleteUser = function (req, res) {};
