export const hideAlert = function () {
  const alertEl = document.querySelector('.alert');
  if (alertEl) {
    alertEl.parentElement.removeChild(alertEl);
  }
};

export const showAlert = function (type, msg) {
  // Generate markup for alert
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  // Add alert to the DOM
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // Remove alert after 5 seconds
  window.setTimeout(() => {
    hideAlert();
  }, 5000);
};
