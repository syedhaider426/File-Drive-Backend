const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");
const crypto = require("crypto");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");
sgMail.setApiKey(keys.sendgrid_api_key);

register = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref("password"),
  });
  try {
    await schema.validate({
      email: req.body.email,
      password: req.body.password,
      repeat_password: req.body.confirmPassword,
    });
  } catch (err) {
    return res.redirect("/register");
  }

  const db = Connection.db;
  const users = db.collection("users");
  try {
    const email = await users.findOne(
      { email: req.body.email },
      {
        projection: {
          email: 1,
        },
      }
    );
    if (email) return res.redirect("/register");
    const password = await bcrypt.hash(req.body.password, 10);
    const user = {
      email: req.body.email,
      password: password,
      isVerified: false,
    };
    let result = await users.insertOne(user);
    const newUserID = result.insertedId;
    const token = {
      userID: newUserID,
      path: "/confirmRegistration",
      token: crypto.randomBytes(16).toString("hex"),
      createdAt: new Date(),
    };
    await db.collection("tokens").insertOne(token);
    let mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Account Verification - GDrive Clone",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/confirmRegistration?token=" +
        token.token +
        "\n",
    };
    await sgMail.send(mailOptions);
    if (!result) return res.redirect("/register");
    return res.redirect("/verification");
  } catch (err) {
    console.error(err);
  }
};

confirmUser = async (req, res) => {
  const db = Connection.db;
  const tokens = db.collection("tokens");
  try {
    const result = await tokens.findOne({ token: req.query.token });
    if (!result) res.redirect("/register");
    const users = db.collection("users");
    await users.updateOne(
      { _id: result.userID },
      { $set: { isVerified: true } }
    );
    return res.redirect("/confirmationSuccess");
  } catch (err) {
    console.error("Err", err);
  }
};

resendVerificationEmail = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  try {
    await schema.validate({ email: req.body.email });
  } catch (err) {
    return res.redirect("/forgotPassword");
  }
  const db = Connection.db;
  const users = db.collection("users");
  try {
    const user = await users.findOne(
      { email: req.body.email },
      {
        projection: {
          email: 1,
          isVerified: 1,
        },
      }
    );
    if (!user) return res.redirect("/forgotPassword");
    if (user.isVerified) return res.redirect("/confirmationSuccess");
    const token = {
      userID: user._id,
      path: "/newPassword",
      token: crypto.randomBytes(16).toString("hex"),
      createdAt: new Date(),
    };
    await db.collection("tokens").insertOne(token);
    let mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Account Verification - GDrive Clone",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/confirmRegistration?token=" +
        token.token +
        "\n",
    };
    await sgMail.send(mailOptions);
    return res.redirect("/verification");
  } catch (err) {
    console.error(err);
  }
};

module.exports = { register, confirmUser, resendVerificationEmail };
