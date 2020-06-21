const LocalStrategy = require("passport-local").Strategy;

const user = require("./passportSerialize");
/* http://toon.io/understanding-passportjs-authentication-flow/*/
const { checkNotAuthenticated } = require("../middlewares/requireLogin");

initializePassport = (app, passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, user.authenticate)
  );
  passport.serializeUser(user.serialize);
  passport.deserializeUser(user.deserialize);
  app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
      successRedirect: "/file",
      failureRedirect: "/",
    })
  );

  console.log("Passport initialized");
};

module.exports = initializePassport;
