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

// Resetting password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Updating current logged in user's password
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

// Updating current logged in user's data
router.patch('/updateMe', authController.protect, userController.updateMe);

// Delete current user
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// Mount routers
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
