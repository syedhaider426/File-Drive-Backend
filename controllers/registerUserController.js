const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");
const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const returnObjectID = require("../database/returnObjectID");
sgMail.setApiKey(keys.sendgrid_api_key);

exports.register = async (req, res, next) => {
  //Create JOI schema
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
    const newUser = await Connection.db.collection("users").insertOne({
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
        "\n",
    };

    // Send email
    await sgMail.send(mailOptions);

    // Return success status back to client
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
  }
};

exports.confirmUser = async (req, res) => {
  try {
    // Verify token
    const result = await jwt.verify(req.query.token, keys.jwtPrivateKey);

    // Throw error if token expired or is invalid
    if (!result)
      return res.status(400).json({
        error: {
          message:
            "There was an error confirming your email. Please try again.",
        },
      });

    // Verify the user by updating isVerified field in the db
    const verifiedUser = await Connection.db
      .collection("users")
      .updateOne(
        { _id: returnObjectID(result._id) },
        { $set: { isVerified: true } }
      );

    // On successful update, send the 'success' response to the client
    if (verifiedUser.result.nModified === 1)
      return res.json({
        sucess: {
          message: "You have succesfully registered your account.",
        },
      });
  } catch (err) {
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "Account could not be confirmed at this time. Please try again later.",
        },
      });
    else return res.status(404).json(err);
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
