// Handlers
exports.getAllTours = function (req, res) {
  (req, res) => {
    res.json({ status: 'success', results: tours.length, data: { tours } });
  };
};
exports.getTour = function (req, res) {};
exports.addTour = function (req, res) {
  console.log(req.body);
  res.end('Done');
};
exports.updateTour = function (req, res) {};
exports.deleteTour = function (req, res) {};
