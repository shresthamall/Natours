const { StatusCodes } = require('http-status-codes');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../utils/apiFeatures');
const APIFeatures = require('./../utils/apiFeatures');

// Delete one document with specified ID for specified model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(
        new APPError(
          'No document was found with this id!',
          StatusCodes.BAD_REQUEST
        )
      );

    res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });

// Update one document with specified ID for specified model
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(
        new APPError(
          `No document was found with this id!`,
          StatusCodes.NOT_FOUND
        )
      );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { data: doc },
    });
  });

// Create one document for a specified Model
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    // Filter fields -> Improve TODO
    doc['__v'] = undefined;
    const modelName = Model.modelName;
    const data = {};
    data[modelName] = doc;

    // Resolve connection - success
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data,
    });
  });

// Get one document for specified Model | popOptions are provided in case of .populate()
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);
    // Check if there are population options -> Add .populate()
    if (popOptions) query = query.populate(popOptions);
    // Get the document
    const doc = await query;
    // Send error if no document found
    if (!doc) {
      return next(
        new APPError(
          `No document was found with id: ${id}`,
          StatusCodes.NOT_FOUND
        )
      );
    }
    // Send response
    const modelName = Model.modelName;
    const data = {};
    data[modelName] = doc;
    res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  });

// Get all documents for specified Model
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // This is only for finding reviews when accessing through /tours route == nested route == find all reviews for said tour
    const tour = {};
    req.params.tourId ? (tour.tour = req.params.tourId) : '';

    // Everything below common procedure for all Models
    const features = new APIFeatures(Model.find(tour), req.query);

    const query = features.filter().sort().limitFields().paginate().getQuery();

    // const doc = await query.explain();
    const doc = await query;

    // Send response // TODO: May need to change modelName to data to make is easier to implement front end side
    const modelName = `${Model.modelName}s`;
    const data = {};
    data[modelName] = doc;
    res
      .status(StatusCodes.OK)
      .json({ status: 'success', results: doc.length, data });
  });
