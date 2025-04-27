const multer = require('multer');
const sharp = require('sharp');
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

const createFileName = (userID) => {
  return `user-${userID}-${Date.now()}.jpeg`;
};

const createMulterUpload = () => {
  //// Multer -- Photo Uploads
  // Store uploaded files in memory as a buffer
  const storage = multer.memoryStorage();
  // Create multer filter
  const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Not an image! Please upload only images.',
          StatusCodes.BAD_REQUEST
        ),
        false
      );
    }
  };
  return multer({ storage, fileFilter });
};

// Create middleware to handle photo file uploads. The field name in the form should be 'photo'
exports.uploadUserPhoto = createMulterUpload().single('photo');

// Handlers
exports.resizePhoto = catchAsync(async function (req, res, next) {
  // No file uploaded
  if (!req.file) return next();
  // If photo has been uploaded
  // Create fileName for the photo, if provided
  req.file.fileName = createFileName(req.user.id);

  // Add userPhoto to disk
  const resUpload = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.fileName}`);
  console.log(resUpload);
  next();
});

exports.updateMe = catchAsync(async function (req, res, next) {
  // TODO: Delete
  console.log(req.file);
  console.log('********************', req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for updating password. Please use /updateMyPassword',
        StatusCodes.BAD_REQUEST
      )
    );
  // Filter the object received in request
  const filteredBody = filterObj(req.body, 'name', 'email');
  // Add photo to filteredBody, if an image has been uploaded
  filteredBody.photo = req.file.fileName;

  // 2) Update user document
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

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};
// No routes implemented for this
exports.getUser = factory.getOne(User);

// Get all users
exports.getAllUsers = factory.getAll(User);

// Reserved for users with 'admin' roles
// DO NOT USE THIS TO UPDATE PASSWORDS, WILL NOT RUN SAFETY MIDDLEWARES
exports.updateUser = factory.updateOne(User);
// WILL DELETE USER FROM DB
exports.deleteUser = factory.deleteOne(User);
