const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

// Handlers

exports.topToursCheap = function (req, _, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);

    // Resolve connection - success
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    // Resolve connection - failed
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getAllTours = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({
      status: 'failed',
      message: 'Could not find any tours!',
    });
  }
};

exports.getTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({
      status: 'failed',
      message: 'Could not find this tours!',
    });
  }
};
exports.updateTour = async function (req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(StatusCodes.OK).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({
      status: 'failed',
      message: 'Could not find this tours!',
    });
  }
};
exports.deleteTour = async function (req, res) {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.NO_CONTENT).json({});
  } catch (err) {
    res.status(StatusCodes.FORBIDDEN).json({});
  }
};

exports.getTourStats = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

exports.getMonthlyTours = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};
