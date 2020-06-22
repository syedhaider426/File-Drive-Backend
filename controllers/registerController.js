const bcrypt = require("bcrypt");
const Connection = require("../database/Connection");
const crypto = require("crypto");

const keys = require("../config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);

register = async (req, res) => {
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
      token: crypto.randomBytes(16).toString("hex"),
      createdAt: new Date(),
    };
    await db.collection("tokens").insertOne(token);
    let mailOptions = {
      from: keys.email,
      to: req.body.email,
      subject: "Account Verification - Drive Clone",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/confirmation/" +
        token.token +
        "\n",
    };
    console.log(mailOptions.text);
    await sgMail.send(mailOptions);
    console.log("Sent mail");
    if (!result) return res.redirect("/register");
    res.redirect("/");
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

confirmUser = async (req, res) => {
  const db = Connection.db;
  const tokens = db.collection("tokens");
  const result = await tokens.findOne({ token: req.params.token });
  if (!result) res.redirect("/register");
  const userID = result.userID;
  const users = db.collection("users");
  await users.updateOne({ _id: userID }, { $set: { isVerified: true } });
  return res.redirect("/");
};

module.exports = { register, confirmUser };
