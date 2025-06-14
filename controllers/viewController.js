const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');

exports.getOverview = catchAsync(async (req, res, next) => {
  //  1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  //  3) Render that template using tour data from 1)

  res.status(StatusCodes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const [tour] = await Tour.find({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // Check if tour exists
  if (!tour) {
    return next(
      new AppError('No tour found with that name', StatusCodes.NOT_FOUND)
    );
  }

  // 2) Build template
  // 3) Render template using data from step 1)
  res.status(StatusCodes.OK).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings for the user
  const bookings = req.user.bookings;
  // console.log(req.user);

  // 2) Find tours with the returned IDs
  const tours = await Tour.find({
    _id: { $in: bookings.map((el) => el.tour) },
  });

  // 3) Render template with the tours
  res.status(StatusCodes.OK).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  // Render login form
  res.status(StatusCodes.OK).render('login', {
    title: 'Log into your account',
  });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  // Render signup form
  res.status(StatusCodes.OK).render('signup', {
    title: 'Create your account!',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  // Render account form
  res.status(StatusCodes.OK).render('account', {
    title: 'Your account',
  });
});
