const fs = require('fs');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Middleware - Check ID
exports.checkID = function (req, res, next, val) {
  // ID validation return if not, else move to next middleware
  if (+val > tours.length) {
    return res.end();
  }
  next();
};

exports.checkBody = function (req, res, next) {
  // Body validation
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Missing name and/or price' });
  }
  next();
};

// Handlers
exports.getAllTours = function (req, res) {
  (req, res) => {
    res.json({ status: 'success', results: tours.length, data: { tours } });
  };
};
exports.getTour = function (req, res) {};
exports.addTour = function (req, res) {
  console.log(req.body);
  res.end('Done');
};
exports.updateTour = function (req, res) {};
exports.deleteTour = function (req, res) {};
