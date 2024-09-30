const { StatusCodes } = require('http-status-codes');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
    const modelName = Model.modelName;
    const data = {};
    data[modelName] = doc;

    // Resolve connection - success
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data,
    });
  });
