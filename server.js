const mongoose = require('mongoose');
const dotenv = require('dotenv');

const UNCAUGHT_EXCEPTION_CODE = 1;
// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.log('Shutting down', err.message);
  process.exit(UNCAUGHT_EXCEPTION_CODE);
});

// Define global env variables
dotenv.config({ path: './config.env' });
const app = require('./app');

// Retrieve port and database api url
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

const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

// Unhandled exception handling - Log error message, close server and exit process
// Deprecated!!!!
process.on('unhandledRejection', (err) => {
  server.close(() => {
    console.error(`Unhandled exception: ${err} Shutting down...`);
    // Set exitCode to be used when process exits
    process.exitCode(UNCAUGHT_EXCEPTION);
    throw err;
  });
});
