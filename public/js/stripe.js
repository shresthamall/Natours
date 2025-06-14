import axios from 'axios';
import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51RIoqG2fx2GF24XYszgyc951NnCFv0UUBIt1fv3zxF3ntLF7hWsCLBaTRFaPL7c1WLNPJMoeagn6rfMmJaI9atai00PnU9PSp1'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from the server
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //   2) Redirect to payments page
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
