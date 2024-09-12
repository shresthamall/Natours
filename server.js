const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

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

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
