// name, email, photo, password, passwordConfirm
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { validate } = require('./tourModel');
const { UNSUPPORTED_MEDIA_TYPE } = require('http-status-codes');

const userSchemaModel = {
  name: {
    type: String,
    required: [true, 'A user must have a name!'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email.'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password!'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (passConf) {
        return passConf === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
};

const userSchema = mongoose.Schema(userSchemaModel);

userSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
