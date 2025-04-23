const express = require('express');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// Create Router
const router = new express.Router();

// Signup user
router.post('/signup', authController.signup);
// Login user
router.post('/login', authController.login);
// Logout user
router.get('/logout', authController.logout);
// Resetting password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//// Protected routes => Only logged in users can access
router.use(authController.protect);

// Updating current logged in user's password
router.patch('/updateMyPassword', authController.updatePassword);
// Get data for the current logged in user
router.route('/me').get(userController.getMe, userController.getUser);
// Updating current logged in user's data
router.patch('/updateMe', userController.updateMe);
// Delete current user
router.delete('/deleteMe', userController.deleteMe);

//// Restricted routes => Only accessible to admins
router.use(authController.restrictTo('admin'));
// Mount routers
// Root
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
// Specific User
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
