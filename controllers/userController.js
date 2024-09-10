// Handlers
exports.getAllUsers = function (req, res) {
  res.json({ status: 'success', results: tours.length, data: { tours } });
};
exports.getUser = function (req, res) {};
exports.createUser = function (req, res) {};
exports.updateUser = function (req, res) {};
exports.deleteUser = function (req, res) {};
