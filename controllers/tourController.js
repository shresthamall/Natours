const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const Tour = require('./../models/tourModel');

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
      message: 'Invalid Data Sent!',
    });
  }
};

// Remove Reserved params/keywords
const removeExcludedFields = function (queryObj) {
  // Reserved keywords for params
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // Remove reserved keywords from queryObj
  return excludedFields.forEach((ef) => delete { ...queryObj[ef] });
};

// Procedure:
// Create shallow copy Object using {...query} -> Convert to string -> Replace 'operators' with '$operators' -> Convert to Object
const getQueryObj = function (query) {
  return JSON.parse(
    JSON.stringify({ ...query }).replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    )
  );
};

// Sorting

exports.getAllTours = async function (req, res) {
  try {
    // Build query - TODO Create one helper that calls other other helpers to complete filtering and sorting
    // 1) Filering
    const queryKeywordsRemoved = removeExcludedFields(req.query);
    const queryObj = getQueryObj(queryKeywordsRemoved);

    // Get query - will be used for chaining/mounting additional methods before execution
    let query = Tour.find(queryObj);

    // 2) Sorting - TODO export to helper function
    if (req.query.sort) {
      const sortBy = req.query.sort.replaceAll(',', ' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const selectBy = req.query.fields.replaceAll(',', ' ');
      query = query.select(selectBy);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    // console.log(typeof +page, typeof skip, typeof +limit);
    query = query.skip(skip).limit(+limit);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist!');
    }

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
