const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");
const db = Connection.db;

const register = async (req, res) => {
  const users = db.collection("users");
  const email = await users.findOne({ email: req.body.email });
  if (email)
    return res
      .status(404)
      .json({ message: "User with that email already exists" });
  const password = await bcrypt.hash(req.body.password, 10);
  const result = await users.insertOne({
    email: req.body.email,
    password: password,
  });
  if (!result) return res.status(404).json({ message: err });
  return res.redirect("/login");
};

module.exports = register;
