const express = require('express');
const tourController = require('./../controllers/tourController');

// Create tourRouter
const router = new express.Router();

// ID validation
// router.param('id', tourController.checkID);

// Mount routers
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
