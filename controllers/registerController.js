const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");

const register = async (req, res) => {
  const db = Connection.db;
  const users = db.collection("users");
  const email = await users.findOne({ email: req.body.email });
  if (email) return res.redirect("/register");
  const password = await bcrypt.hash(req.body.password, 10);
  const user = {
    email: req.body.email,
    password: password,
  };
  const result = await users.insertOne(user);
  if (!result) return res.redirect("/register");
  req.login(user, function (err) {
    if (err) {
      return next(err);
    }
    return res.redirect("/file");
  });
};

module.exports = register;
