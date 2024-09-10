const express = require('express');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');
const userController = require('./../controllers/userController');

// Create Router
const router = new express.Router();

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
