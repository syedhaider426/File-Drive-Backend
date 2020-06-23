const Connection = require("../database/Connection");
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);

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
  try {
    const user = await users.findOne(
      { _id: req.user._id },
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
  } catch (err) {
    console.error(err);
  }
};

resetEmail = async (req, res) => {
  const db = Connection.db;
  const users = db.collection("users");
  try {
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
      { _id: req.user._id },
      { $set: { email: req.body.newEmail } }
    );
    return res.redirect("/home");
  } catch (err) {
    console.error(err);
  }
};

forgotPassword = async (req, res) => {
  const db = Connection.db;
  const users = db.collection("users");
  try {
    const user = await users.findOne(
      { email: req.body.email },
      {
        projection: {
          email: 1,
        },
      }
    );
    if (!user) res.redirect("/forgotPassword");
    const token = {
      userID: user._id,
      path: "/newPassword",
      token: crypto.randomBytes(16).toString("hex"),
      createdAt: new Date(),
    };
    await db.collection("tokens").insertOne(token);
    let mailOptions = {
      from: keys.email,
      to: "shayder426@gmail.com",
      subject: "Forgotten Password - Drive Clone",
      text:
        "Hello,\n\n" +
        "Please reset your password by clicking the link: \nhttp://" +
        req.headers.host +
        "/newPassword?token=" +
        token.token +
        "\n",
    };

    await sgMail.send(mailOptions);
    res.redirect("/emailSentConfirmation");
  } catch (err) {
    console.error(err);
  }
};

newPassword = async (req, res) => {
  const db = Connection.db;
  const tokens = db.collection("tokens");
  try {
    const user = await tokens.findOne({
      token: req.body.token,
      path: req.path,
    });
    if (!user) res.redirect("/register");
    const userID = user.userID;
    const users = db.collection("users");
    if (!req.body.password) return res.redirect("/register");
    const hash = await bcrypt.hash(req.body.password, 10);
    const result = await users.updateOne(
      { _id: userID },
      { $set: { password: hash } }
    );
    return res.redirect("/passwordChangeSuccess");
  } catch (err) {
    console.error("Err", err);
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  resetPassword,
  resetEmail,
  forgotPassword,
  newPassword,
};
