const Connection = require("../database/Connection");
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
//https://stackoverflow.com/questions/54033722/async-await-is-not-working-for-mongo-db-queries
// You could even ditch the "async" keyword here,
// because you do not do/need any awaits inside the function.
// toArray() without a callback function argument already returns a promise.
getUserByEmail = async (email) => {
  const db = Connection.db;
  const users = db.collection("users");

  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  const result = await users.findOne({ email: email });
  return result;
};

getUserById = async (id) => {
  const db = Connection.db;
  const users = db.collection("users");
  const result = await users.findOne(
    { _id: new mongodb.ObjectID(id) },
    {
      projection: {
        email: 1,
      },
    }
  );
  return result;
};

resetPassword = async (req, res) => {
  const db = Connection.db;
  const users = db.collection("users");
  const user = await users.findOne(
    { _id: new mongodb.ObjectID(req.user._id) },
    {
      projection: {
        password: 1,
      },
    }
  );
  const currentPassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );
  if (!currentPassword) return res.redirect("/resetPassword");
  const hash = await bcrypt.hash(req.body.password, 10);
  const result = await users.updateOne(
    { _id: user._id },
    { $set: { password: hash } }
  );
  return res.redirect("/home");
};

resetEmail = async (req, res) => {
  const db = Connection.db;
  const users = db.collection("users");
  const foundEmail = await users.findOne(
    { email: req.body.newEmail },
    {
      projection: {
        email: 1,
      },
    }
  );
  if (foundEmail) return res.redirect("/resetEmail");
  const result = await users.updateOne(
    { _id: new mongodb.ObjectID(req.user._id) },
    { $set: { email: req.body.newEmail } }
  );
  return res.redirect("/home");
};

module.exports = {
  getUserByEmail,
  getUserById,
  resetPassword,
  resetEmail,
};
