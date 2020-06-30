const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const returnObjectID = require("../database/returnObjectID");
sgMail.setApiKey(keys.sendgrid_api_key);

exports.register = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": `Please provide a proper email address.`,
      "any.required": `Email cannot be empty.`,
    }),
    password: Joi.string().required().messages({
      "any.required": `Password cannot be empty.`,
    }),
    repeat_password: Joi.ref("password"),
  });

  const validation = await schema.validate(
    {
      email: req.body.email,
      password: req.body.password,
      repeat_password: req.body.confirmPassword,
    },
    { abortEarly: false }
  );
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const newUser = await Connection.db.collection("users").insertOne({
      email: req.body.email,
      password: password,
      isVerified: false,
    });
    const token = await jwt.sign(
      { id: newUser.insertedId },
      keys.jwtPrivateKey,
      {
        expiresIn: "1h",
      }
    );
    const mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Account Verification - GDrive Clone",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/confirmRegistration?token=" +
        token +
        "\n",
    };
    await sgMail.send(mailOptions);
    return res.status(201).json({
      success: {
        message:
          "You have successfully registered your account. Please check your email to confirm your account.",
      },
    });
  } catch (err) {
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "Email is already registered. Please try again.",
        },
      });
    else if (err.code === 400) {
      return res.status(400).json({
        error: {
          message:
            "Confirmation email was not sent. Please register with a valid email address.",
        },
      });
    }
  }
};

exports.confirmUser = async (req, res) => {
  const users = Connection.db.collection("users");

  try {
    const result = await jwt.verify(req.query.token, keys.jwtPrivateKey);
    if (!result) res.redirect("/verificationEmail");

    await users.updateOne(
      { _id: returnObjectID(result.id) },
      { $set: { isVerified: true } }
    );
    return res.redirect("/confirmationSuccess");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.resendVerificationEmail = async (req, res) => {
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
          isVerified: 1,
        },
      }
    );
    if (!user) return res.redirect("/forgotPassword");
    if (user.isVerified) return res.redirect("/confirmationSuccess");
    const token = await jwt.sign({ id: user._id }, keys.jwtPrivateKey, {
      expiresIn: "1h",
    });
    let mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Account Verification - GDrive Clone",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/confirmRegistration?token=" +
        token +
        "\n",
    };
    console.log("Send");
    const t = await sgMail.send(mailOptions);
    console.log(t);
    return res.redirect("/verification");
  } catch (err) {
    console.error(err);
  }
};
