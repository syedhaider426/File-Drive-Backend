const Connection = require("../database/Connection");

module.exports = checkToken = async (req, res, next) => {
  const tokens = Connection.db.collection("tokens");
  if (!req.query.token) res.redirect("/");
  const token = await tokens.findOne({
    token: req.query.token,
    path: req.path,
  });
  if (!token) return res.redirect("/");
  next();
};
