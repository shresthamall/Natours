const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// Create tourRouter
const router = new express.Router();

// Mount routers
// Nested routes:
router.use('/:tourId/reviews', reviewRouter);

// Tour routes
router.route('/monthly-stats/:year').get(tourController.getMonthlyTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourController.topToursCheap, tourController.getAllTours);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
