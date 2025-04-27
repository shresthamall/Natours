import '@babel/polyfill';
import { displayMap } from './leaflet.js';
import { login, logout, signup } from './login.js';
import { updateSettings } from './updateSettings.js';
import { showAlert } from './alert.js';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userAccountWindow = document.querySelector('.user-view');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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
    const form = new FormData();
    form.append(
      'passwordCurrent',
      document.getElementById('password-current').value
    );
    form.append('password', document.getElementById('password').value);
    form.append(
      'passwordConfirm',
      document.getElementById('password-confirm').value
    );
    console.log(form.get('passwordCurrent'));
    await updateSettings(form, 'password');
    targetBtn.textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
