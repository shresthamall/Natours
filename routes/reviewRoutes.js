const express = require('express');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = new express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

module.exports = router;
