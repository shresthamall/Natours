const express = require('express');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = new express.Router();

router
  .route('/')
  .post(authController.protect, reviewController.createReview)
  .get(reviewController.getAllReviews);

module.exports = router;
