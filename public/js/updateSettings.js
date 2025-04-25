import axios from 'axios';
import { showAlert } from './alert.js';
const API_URL = 'http://127.0.0.1:3000/api/v1';

export const updateUserData = async function (name, email) {
  // Create URL
  const url = `${API_URL}/users/updateMe`;
  // Create user data
  const userData = {
    name,
    email,
    // render: true,
  };
  try {
    // Send request server
    const res = await axios({
      method: 'PATCH',
      url,
      data: userData,
    });
    // Show success message
    if (res.data.status === 'success') {
      showAlert('success', 'User data updated successfully!');
      // Reload page after 1.5 seconds
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateUserPassword = async function (
  passwordCurrent,
  password,
  passwordConfirm
) {
  // 1) Check if password and passwordConfirm are the same
  if (password !== passwordConfirm) {
    showAlert('error', 'Password and passwordConfirm do not match!');
    return;
  }
  // 2) Create URL
  const url = `${API_URL}/users/updateMyPassword`;
  // 3) Create user data
  const userData = {
    passwordCurrent,
    password,
    passwordConfirm,
  };
  try {
    // 4) Send request to server
    const res = await axios({
      method: 'PATCH',
      url,
      data: userData,
    });
    // Show success message
    if (res.data.status === 'success') {
      showAlert('success', 'Password updated successfully!');
      // Reload page after 1.5 seconds
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
