const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

// Returns promise, then() gets access to connections arguments
mongoose
  .connect(DB)
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.log(err.message);
  });

let tours = [];
let users = [];
let reviews = [];

try {
  tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
  users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
  reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
} catch (err) {
  console.error('Error reading JSON files:', err.message);
  process.exit(1);
}
/*
 * On Render, file system operations (like reading/writing files) are limited.
 * Make sure your JSON files (tours.json, users.json, reviews.json) are committed to your repo,
 * and not generated at runtime or written to disk, as Render's file system is ephemeral.
 * No code changes are needed here if you only read files that are present in your repo.
 * If you need to write files, use a persistent storage solution (like AWS S3 or a database).
 */
const importData = async function () {
  try {
    if (process.argv.includes('--tours')) {
      await Tour.create(tours);
    }
    if (process.argv.includes('--users')) {
      await User.create(users, { validateBeforeSave: false });
    }
    if (process.argv.includes('--reviews')) {
      await Review.create(reviews, { validateBeforeSave: false });
    }
    console.log(`Data imported from file successfully!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async function () {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`Data deleted successfully!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
