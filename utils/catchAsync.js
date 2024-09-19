/* 
Catches errors in the async function fn()
Usage: 
const catchAsync = require('./catchAsycn.js');


const foo1 = async function (x, y, z) {
try {***logic***} catch {***error handling***}
};

const foo2 = catchAsync(async function(x, y, z) {
***logic***
});

foo1 === foo2
*/
module.exports = (fn) => (req, res, next) =>
  //   fn(req, res, next).catch((err) => next(err));
  fn(req, res, next).catch(next);
