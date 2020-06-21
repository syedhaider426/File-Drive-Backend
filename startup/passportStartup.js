const passport = require("passport");
const initializePassport = require("../services/passportConfig");

module.exports = function (app) {
  app.use(passport.initialize()); //passport logic
  app.use(passport.session()); //persist across the session
  initializePassport(app, passport);
};
