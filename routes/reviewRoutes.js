const express = require('express');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// Create router and merge parameters for this nested route => gain access to params from tour router
const router = new express.Router({ mergeParams: true });

//// Protected routes => Only accessible to logged in users
router.use(authController.protect);
// Root
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.addReviewTourIdUserId,
    reviewController.createReview
  );
// Specific Review
router
  .route('/:id')
  .patch(authController.restrictTo('user'), reviewController.updateReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
