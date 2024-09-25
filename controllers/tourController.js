const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');
// Handlers

exports.topToursCheap = function (req, _, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = catchAsync(async function (req, res, next) {
  const newTour = await Tour.create(req.body);

  // Resolve connection - success
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.getAllTours = catchAsync(async function (req, res, next) {
  // Get apiFeatures from utils, send a new mongoose query and client queryObject
  const features = new APIFeatures(Tour.find(), req.query);
  // Clean up query and mount methods
  const query = features.filter().sort().limitFields().paginate().getQuery();

  // Execute query
  const tours = await query;
  // Send response
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const id = req.params.id;

  const tour = await Tour.findById(id);
  // If valid ID but no document found
  if (!tour) {
    console.log('tour undefined');
    return next(
      new AppError(`No tour was found with id: ${id}`, StatusCodes.NOT_FOUND)
    );
  }
  // Send response
  res.status(StatusCodes.OK).json({ status: 'success', data: { tour } });
});
exports.updateTour = catchAsync(async function (req, res, next) {
  const id = req.params.id;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  console.log('💥Tour: ', tour);
  // If valid ID but no document found
  if (!tour)
    return next(
      new AppError(`No tour was found with id: ${id}`, StatusCodes.NOT_FOUND)
    );
  // Send response
  res.status(StatusCodes.OK).json({ status: 'success', data: { tour } });
});
exports.deleteTour = catchAsync(async function (req, res, next) {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);
  // If valid ID but no document found
  if (!tour)
    return next(
      new AppError(`No tour was found with id: ${id}`, StatusCodes.NOT_FOUND)
    );
  // Send response
  res.status(StatusCodes.NO_CONTENT).json({});
});

exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(StatusCodes.OK).json({ status: 'success', data: { stats } });
});

exports.getMonthlyTours = catchAsync(async function (req, res, next) {
  // Get total number of tours offered in a specified year for each month
  const year = +req.params.year;
  console.log(year);
  const monthlyTours = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { monthlyTours } });
});
