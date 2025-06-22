const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// Create tourRouter
const router = new express.Router();

// router.get(
//   '/checkout-session/:tourId',
//   authController.protect,
//   bookingController.createCheckoutSession
// );

module.exports = router;
