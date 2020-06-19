const LocalStrategy = require("passport-local").Strategy;

const { authenticateUser } = require("./authenticateUser");
const user = require("./passportSerialize");
/* http://toon.io/understanding-passportjs-authentication-flow/*/
const { checkNotAuthenticated } = require("./checkAuthentication");

initialize = (app, passport) => {
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser(user.serialize);
  passport.deserializeUser(user.deserialize);
  app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
      successRedirect: "/file",
      failureRedirect: "/login",
    })
  );
  console.log("Passport initialized");
};

module.exports = {
  initialize,
};
