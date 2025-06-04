import '@babel/polyfill';
import { displayMap } from './leaflet.js';
import { login, logout, signup } from './login.js';
import { updateSettings } from './updateSettings.js';
import { showAlert } from './alert.js';
import { bookTour } from './stripe.js';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userAccountWindow = document.querySelector('.user-view');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  const startLocation = JSON.parse(mapBox.dataset.startLocation);
  displayMap(locations, startLocation);
}

if (loginForm !== null) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (loginForm?.classList.contains('signup')) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

// User Account page Event Delegation
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetBtn = e.target.querySelector('.btn--save-settings');
    targetBtn.textContent = 'Updating...';
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateSettings(form, 'data');
    targetBtn.textContent = 'Save settings';
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetBtn = e.target.querySelector('.btn--save-password');
    targetBtn.textContent = 'Updating...';
    const data = {
      passwordCurrent: document.getElementById('password-current').value,
      password: document.getElementById('password').value,
      passwordConfirm: document.getElementById('password-confirm').value,
    };
    // console.log(data);
    await updateSettings(data, 'password');
    targetBtn.textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    // console.log('*****************', tourId);
    // Book tour
    await bookTour(tourId);
  });
}
