const Connection = require("../database/Connection");

module.exports = checkToken = async (req, res, next) => {
  const tokens = Connection.db.collection("tokens");
  if (!req.params.token) res.redirect("/");
  const token = await tokens.findOne({ token: req.params.token });
  if (!token) return res.redirect("/");
  next();
};
