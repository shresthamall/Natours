import axios from 'axios';
import { showAlert } from './alert.js';
const API_URL = 'http://127.0.0.1:3000/api/v1';

export const updateSettings = async function (data, type) {
  // 1) Check if password and passwordConfirm are the same
  if (data?.password !== data?.passwordConfirm) {
    showAlert('error', 'Password and passwordConfirm do not match!');
    return;
  }
  // Create URL
  // const url = `${API_URL}/users/${
  const url = `/api/v1/users/${
    type === 'data' ? 'updateMe' : 'updateMyPassword'
  }`;
  try {
    // Send request server
    const res = await axios({
      method: 'PATCH',
      url,
      data,
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
