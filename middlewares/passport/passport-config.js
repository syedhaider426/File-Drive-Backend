const LocalStrategy = require("passport-local").Strategy;

const { authenticateUser } = require("./authenticateUser");
const user = require("./passport-serialize");
/* http://toon.io/understanding-passportjs-authentication-flow/*/

initialize = (passport) => {
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser(user.serialize);
  passport.deserializeUser(user.deserialize);
  console.log("Passport initialized");
};

module.exports = {
  initialize,
};
