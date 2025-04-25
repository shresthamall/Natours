import '@babel/polyfill';
import { displayMap } from './leaflet.js';
import { login, logout, signup } from './login.js';
import { updateUserData, updateUserPassword } from './updateSettings.js';
import { showAlert } from './alert.js';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userAccountWindow = document.querySelector('.user-view');

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
  console.log('Inside signup if');
  console.log(`loginForm1: ${loginForm}`);
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('event triggered');
    console.log(`loginForm2: ${loginForm}`);

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

// User Account page Event Delegation
if (userAccountWindow) {
  userAccountWindow.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target;
    // Delegate work according to the element clicked
    // A) User data update requested: Name and email change allowed
    if (target.classList.contains('btn--save--settings')) {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      updateUserData(name, email);
    }

    if (target.classList.contains('btn--save--password')) {
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      updateUserPassword(passwordCurrent, password, passwordConfirm);
    }
  });
}
