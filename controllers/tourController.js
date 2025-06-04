const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

// Helper fns
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

// Handlers

exports.topToursCheap = function (req, _, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

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
  res.status(StatusCodes.OK).json({ status: 'success', data: { data: stats } });
});

exports.getMonthlyTours = catchAsync(async function (req, res, next) {
  // Get total number of tours offered in a specified year for each month
  const year = +req.params.year;
  // console.log(year);
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
        // $push operator used to create array
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
    .json({ status: 'success', data: { data: monthlyTours } });
});

exports.toursWithin = catchAsync(async function (req, res, next) {
  // Get the data from url
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

exports.getDistances = catchAsync(async function (req, res, next) {
  // Get the data from url
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
        secretTour: 1,
      },
    },
  ]);
  res.status(StatusCodes.OK).json({
    status: 'success',
    results: distances.length,
    data: { data: distances },
  });
});

// Adds uploaded image files to req.files as memory buffer
exports.uploadTourPhotos = createMulterUpload().fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourPhotos = catchAsync(async function (req, res, next) {
  // No file uploaded
  if (!req.files) return next();
  // Get tourId
  const tourId = req.params.id;

  // console.log(req.files);

  // req.files obj contains imageCover and images => both are arrays with image files in them
  // Cover image
  if (Array.isArray(req.files.imageCover) && req.files.imageCover.length > 0) {
    // Create imageCoverFilename
    req.body.imageCover = `tour-${tourId}-${Date.now()}-cover.jpeg`;
    // Add imageCover to disk
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  // Images
  if (Array.isArray(req.files.images) && req.files.images.length > 0) {
    // Create images filenames
    req.body.images = [];
    // Loop through each file in array and process each image
    Promise.all(
      req.files.images.map(async (file, i) => {
        // Create filename for image i+1 and add it to images
        req.body.images.push(`tour-${tourId}-${Date.now()}-${i + 1}.jpeg`);
        // Save image to disk
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .toFile(`public/img/tours/${req.body.images[i]}`);
      })
    );
  }

  next();
});

exports.getTour = factory.getOne(Tour, 'reviews');

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// exports.getTour = catchAsync(async function (req, res, next) {
//   const id = req.params.id;
//   // Find tour and populate guides field
//   const tour = await Tour.findById(id).populate('reviews');
//   // If valid ID but no document found
//   if (!tour) {
//     console.log('tour undefined');
//     return next(
//       new AppError(`No tour was found with id: ${id}`, StatusCodes.NOT_FOUND)
//     );
//   }
//   // Send response
//   res.status(StatusCodes.OK).json({ status: 'success', data: { tour } });
// });

// exports.getAllTours = catchAsync(async function (req, res, next) {
//   // Get apiFeatures from utils, send a new mongoose query and client queryObject
//   const features = new APIFeatures(Tour.find(), req.query);
//   // Clean up query and mount methods
//   const query = features.filter().sort().limitFields().paginate().getQuery();

//   // Execute query
//   const tours = await query;
//   // Send response
//   res
//     .status(StatusCodes.OK)
//     .json({ status: 'success', results: tours.length, data: { tours } });
// });
