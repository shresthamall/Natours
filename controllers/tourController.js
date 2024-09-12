const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const Tour = require('./../models/tourModel');

// Handlers

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

exports.getAllTours = async function (req, res) {
  try {
    const tours = await Tour.find();
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
