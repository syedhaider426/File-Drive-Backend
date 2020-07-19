const Connection = require("../database/Connection");
const returnObjectID = require("../database/returnObjectID");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);

exports.getUserByEmail = async (email) => {
  return await Connection.db
    .collection("users")
    .findOne({ email: email }, { _id: 1 });
};

exports.getUserById = async (id) => {
  return await Connection.db
    .collection("users")
    .findOne({ _id: returnObjectID(id) }, { _id: 1 });
};

exports.resetPassword = async (req, res, next) => {
  // Create JOI Schema
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    newPassword: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    confirmPassword: Joi.valid(Joi.ref("newPassword")).messages({
      "any.only": `Confirmed password does not match entered password`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate(
    {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    },
    { abortEarly: false }
  );

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    const users = Connection.db.collection("users");
    // Finds current user's password
    const user = await users.findOne({ _id: req.user._id }, { password: 1 });

    // Compare hash against current user's password
    const passwordVerified = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );

    if (!passwordVerified)
      return res.status(400).json({
        error: {
          message: "Password entered does not match current password",
        },
      });

    // Hash the new password
    const hash = await bcrypt.hash(req.body.newPassword, 10);

    const changedPasswordResult = await users.updateOne(
      { _id: user._id },
      { $set: { password: hash } }
    );
    if (changedPasswordResult)
      return res.status(200).json({
        success: {
          message: "Password has been successfully changed. Please sign out.",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });
    else next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  //Create JOI schema
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot be empty.`,
      "string.email": `Please provide a proper email address.`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate({ email: req.body.email });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    // Gets user's id
    const user = await Connection.db
      .collection("users")
      .findOne({ email: req.body.email }, { _id: 1 });

    // Stores id in token
    const token = await jwt.sign({ id: user._id }, keys.jwtPrivateKey, {
      expiresIn: "1h",
    });

    // Set mail content for SendGrid to send
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

    // Send email via SendGrid
    await sgMail.send(mailOptions);

    // Return success status back to client
    return res.status(200).json({
      success: {
        message: "Please check your email to reset your password.",
      },
    });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an issue sending a new confirmation mail. Please try again.",
        },
      });
    else next(err);
  }
};

exports.newPassword = async (req, res, next) => {
  //Create JOI schema
  const schema = Joi.object({
    password: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    repeat_password: Joi.valid(Joi.ref("password")).messages({
      "any.only": `Confirmed password does not match entered password`,
    }),
  });
  // Validate user inputs
  const validation = await schema.validate({
    password: req.body.password,
    repeat_password: req.body.confirmPassword,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    const user = await jwt.verify(req.body.token, keys.jwtPrivateKey);
    // Throw error if token expired or is invalid
    if (!user)
      return res.status(400).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });

    // Hash the new password entered
    const hash = await bcrypt.hash(req.body.password, 10);
    const changedPasswordResult = await Connection.db
      .collection("users")
      .updateOne({ _id: user.id }, { $set: { password: hash } });
    if (changedPasswordResult)
      return res.status(200).json({
        success: {
          message: "Password has been successfully changed. Please log in.",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });
    else next(err);
  }
};
