const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const returnObjectID = require("../database/returnObjectID");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);
const Connection = require("../database/Connection");
const users = Connection.db.collection("users");

exports.register = async (req, res, next) => {
  //Create JOI schema
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": `Please provide a proper email address.`,
      "string.empty": `Email cannot be empty.`,
    }),
    password: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    repeat_password: Joi.valid(Joi.ref("password")).messages({
      "any.only": `Confirmed password does not match entered password`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate(
    {
      email: req.body.email,
      password: req.body.password,
      repeat_password: req.body.confirmPassword,
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
    // Hash the inputted password
    const password = await bcrypt.hash(req.body.password, 10);

    // Create new user
    const newUser = await users.insertOne({
      email: req.body.email,
      password: password,
      isVerified: false,
    });

    // Create JWT
    const token = await jwt.sign(
      { _id: newUser.insertedId },
      keys.jwtPrivateKey,
      {
        expiresIn: "1h",
      }
    );

    // Set details for email for SendGrid to send
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
        "\n\n" +
        "If you have received this email by mistake, simply delete it.",
    };

    // Send email via SendGrid
    await sgMail.send(mailOptions);

    // Return success status back to client
    return res.status(201).json({
      success: {
        message:
          "You have successfully registered your account. Please check your email to confirm your account.",
      },
    });
  } catch (err) {
    // If email already exists, throw an error
    if (err.name === "MongoError")
      return res.status(409).json({
        error: {
          message: "Email is already registered. Please try again.",
        },
      });
    else next(err);
  }
};

exports.confirmUser = async (req, res, next) => {
  try {
    // Verify token
    const user = await jwt.verify(req.query.token, keys.jwtPrivateKey);

    // Throw error if token expired or is invalid
    if (!user)
      return res.status(400).json({
        error: {
          message:
            "There was an error confirming your email. Please try again.",
        },
      });

    // Verify the user by updating isVerified field in the db
    const verifiedUser = await users.updateOne(
      { _id: returnObjectID(user._id) },
      { $set: { isVerified: true } }
    );

    // On successful update, send the 'success' response to the client
    if (verifiedUser.result.nModified === 1)
      return res.json({
        sucess: {
          message: "You have succesfully registered your account.",
        },
      });
    // This error occurs when a user had a confirmation email sent to their account, but never registered a account.
    else
      return res.status(404).json({
        error: {
          message:
            "Account could not be confirmed at this time. Please try again later.",
        },
      });
  } catch (err) {
    // If Mongo is unable to verify the user, return an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "Account could not be confirmed at this time. Please try again later.",
        },
      });
    else next(err);
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  // Create JOI Schema
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": `Please provide a proper email address.`,
      "any.required": `Email cannot be empty.`,
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
    // Finds user based off email
    const user = await users.findOne({ email: req.body.email });

    // If the user is already verified, notify them to sign in
    if (user.isVerified)
      return res.json({
        success: {
          message: "You have already confirmed your account. Please sign in.",
        },
      });

    // Generate JWT
    const token = await jwt.sign({ _id: user._id || "" }, keys.jwtPrivateKey, {
      expiresIn: "1h",
    });

    // Set mail content for SendGrid to send
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
        "\n\n" +
        "If you have received this email by mistake, simply delete it.",
    };

    // Send email via SendGrid
    await sgMail.send(mailOptions);

    // Return success status back to client
    return res.status(201).json({
      success: {
        message: "Please check your email to confirm your account.",
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
