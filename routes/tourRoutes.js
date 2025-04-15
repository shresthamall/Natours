const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// Create tourRouter
const router = new express.Router();

////// Mount routers
// Nested routes:
router.use('/:tourId/reviews', reviewRouter);

//// Tour routes
// Special endpoints
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourController.topToursCheap, tourController.getAllTours);
router
  .route('/monthly-stats/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyTours
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// Root
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
// Specific tour
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
