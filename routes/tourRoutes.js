const express = require('express');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');
const tourController = require('./../controllers/tourController');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Create tourRouter
const router = new express.Router();

// Mount routers
router.route('/').get(tourController.getAllTours).post(tourController.addTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
