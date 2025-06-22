const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const appError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');

// const createBookingCheckoutSession = catchAsync(async function (
//   tourId,
//   userId,
//   price
// ) {
//   try {
//     const booking = await Booking.create({
//       tour: tourId,
//       user: userId,
//       price,
//     });
//     return booking;
//   } catch (err) {
//     // console.error('Error creating booking:', err);
//     throw new appError('Failed to create booking');
//   }
// });

const createBookingCheckout = catchAsync(async function (session) {
  const tourId = session.client_reference_id;
  const userId = (await User.findOne({ $email: session.customer_email })).id;
  const price = session.line_items.price_data.unit_amount / 100;
  try {
    const booking = await Booking.create({
      tour: tourId,
      user: userId,
      price,
    });
    return booking;
  } catch (err) {
    // console.error('Error creating booking:', err);
    throw new appError('Failed to create booking');
  }
});

exports.webHookCheckout = catchAsync(async function (req, res, next) {
  // Get the signature from Stripe
  const signature = req.headers['stripe-signature'];

  // Create the event
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEEBOOK_SECRET
    );
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(`Webhook error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.body.object);

  res.status(StatusCodes.OK).json({ received: true });
});

exports.createCheckoutSession = catchAsync(async function (req, res, next) {
  // 1) Get tour from db
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }.jpg`,
            ],
          },
        },
      },
    ],
  });

  // createBookingCheckoutSession(tour._id, req.user._id, tour.price);
  // 3) Create session as response
  res.status(StatusCodes.OK).json({
    status: 'success',
    session,
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
