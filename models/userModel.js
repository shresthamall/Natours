// name, email, photo, password, passwordConfirm
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { StatusCodes, NOT_FOUND } = require('http-status-codes');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password!'],
    minlength: 8,
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
};

const userSchema = mongoose.Schema(userSchemaModel);

// Limit inactive users from being shown in results
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Encrypt password before saving it to DB each time a password is changed
userSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Add/Update passwordChanged at to DB anytime a password is changed
userSchema.pre('save', function (next) {
  // Only run if password is modified and if the document is not newly created
  if (!this.isModified('password') || this.isNew) return next();

  // Update field, subtract 1s from timestamp to offset time for JWT creation
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  const lastPasswordChangeAt = this.passwordChangedAt;
  // Return false if password has never been changed
  if (!lastPasswordChangeAt) return false;

  const passwordChangedTimestamp = parseInt(
    lastPasswordChangeAt.getTime() / 1000,
    10
  );
  // Check if JWT is older than previous password change timestamp
  return JWTTimestamp < passwordChangedTimestamp;
};

// Creates a password reset token
userSchema.methods.createPasswordResetToken = function () {
  console.log('entered createPasswordResetToken');
  // Create resetToken
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Set the encrypted token to the user's DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log('password reset hash created');

  // Password reset token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // TODO testing:
  console.log(this.passwordResetToken, { resetToken });

  // Return unencrypted token back to user
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
