import axios from 'axios';
import { showAlert } from './alert.js';
const API_URL = 'http://127.0.0.1:3000/api/v1';

export const login = async function (email, password) {
  // Get user login input data
  try {
    // Get user login input data
    const userData = {
      email,
      password,
    };
    // Create login url
    const loginUrl = `${API_URL}/users/login`;
    // Send login req to server
    const result = await axios({
      method: 'POST',
      url: loginUrl,
      data: userData,
    });
    // console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      // Redirect to overview page after 1500 se    conds
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async function () {
  // console.log('logout in login.js called');
  try {
    const result = await axios({ method: 'GET', url: '/api/v1/users/logout' });
    // console.log(result.data);
    if (result.data.status === 'success') {
      // Show alert
      showAlert('success', 'Logged out successfully!');
      //   Reload page / If current path is .../me -> load overview page
      if (location.pathname === '/me') {
        location.assign('/');
      } else {
        location.reload(true);
      }
    }
    // If logout fails
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async function (name, email, password, passwordConfirm) {
  // console.log(`signup in login.js called`);
  // console.log(name, email, password, passwordConfirm);
  //  Create signup url
  const signupUrl = `${API_URL}/users/signup`;
  //  Create user data
  const userData = {
    name,
    email,
    password,
    passwordConfirm,
  };
  //  Send signup request to server
  try {
    const result = await axios({
      method: 'POST',
      url: signupUrl,
      data: userData,
    });
    // console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'Account created successfully!');
      // Redirect to overview page after 1500 seconds
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
