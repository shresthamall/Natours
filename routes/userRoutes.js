const express = require('express');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// Create Router
const router = new express.Router();

// Signup user
router.post('/signup', authController.signup);

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
