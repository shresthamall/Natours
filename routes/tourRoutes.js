const express = require('express');
const tourController = require('./../controllers/tourController');

// Create tourRouter
const router = new express.Router();

// ID validation
// router.param('id', tourController.checkID);

// Mount routers
router.route('/monthly-stats/:year').get(tourController.getMonthlyTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourController.topToursCheap, tourController.getAllTours);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
