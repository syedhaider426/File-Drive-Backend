const Connection = require("../database/Connection");
const createObjectID = require("../database/returnObjectID");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);

//https://stackoverflow.com/questions/54033722/async-await-is-not-working-for-mongo-db-queries
// You could even ditch the "async" keyword here,
// because you do not do/need any awaits inside the function.
// toArray() without a callback function argument already returns a promise.
exports.getUserByEmail = async (email) => {
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  return await Connection.db.collection("users").findOne({ email: email });
};

exports.getUserById = async (id) => {
  return await Connection.db.collection("users").findOne(
    { _id: createObjectID(id) },
    {
      projection: {
        email: 1,
      },
    }
  );
};

exports.resetPassword = async (req, res) => {
  const schema = Joi.object({
    password: Joi.string().required(),
  });
  try {
    await schema.validate({ password: req.body.password });
  } catch (err) {
    return res.redirect("/resetPassword");
  }

  try {
    const users = Connection.db.collection("users");
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
    await users.updateOne({ _id: user._id }, { $set: { password: hash } });
    return res.redirect("/home");
  } catch (err) {
    console.error(err);
  }
};

exports.resetEmail = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  try {
    await schema.validate({ email: req.body.email });
  } catch (err) {
    return res.redirect("/resetEmail");
  }

  try {
    const foundEmail = await Connection.db.collection("users").findOne(
      { email: req.body.newEmail },
      {
        projection: {
          email: 1,
        },
      }
    );
    if (foundEmail) return res.redirect("/resetEmail");
    await users.updateOne(
      { _id: req.user._id },
      { $set: { email: req.body.newEmail } }
    );
    return res.redirect("/home");
  } catch (err) {
    console.error(err);
  }
};

exports.forgotPassword = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  try {
    await schema.validate({ email: req.body.email });
  } catch (err) {
    return res.redirect("/forgotPassword");
  }

  try {
    const user = await Connection.db.collection("users").findOne(
      { email: req.body.email },
      {
        projection: {
          email: 1,
        },
      }
    );
    if (!user) res.redirect("/forgotPassword");
    const token = await jwt.sign({ id: user._id }, keys.jwtPrivateKey, {
      expiresIn: "1h",
    });
    let mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Forgotten Password - GDrive Clone",
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

exports.newPassword = async (req, res) => {
  const schema = Joi.object({
    password: Joi.string().required(),
    repeat_password: Joi.ref("password"),
  });
  try {
    await schema.validate({
      password: req.body.password,
      repeat_password: req.body.confirmPassword,
    });
  } catch (err) {
    return res.redirect("/newPassword?token=" + req.body.token);
  }
  const user = await jwt.verify(req.body.token, keys.jwtPrivateKey);
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await Connection.db
      .collection("users")
      .updateOne({ _id: user.id }, { $set: { password: hash } });
    return res.redirect("/passwordChangeSuccess");
  } catch (err) {
    console.error("Err", err);
  }
};
