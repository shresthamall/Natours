const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
console.log(module);

exports.createCheckoutSession = catchAsync(async function (req, res, next) {
  // 1) Get tour from db
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    expand: ['line_items'],
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://www.natours.dev/img/tours/${tour.imageCover}.jpg`,
            ],
          },
        },
      },
    ],
  });
  // 3) Send response
  res.status(StatusCodes.OK).json({
    status: 'success',
    session,
  });
});
