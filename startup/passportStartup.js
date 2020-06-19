const session = require("express-session");
const passport = require("passport");
const { initialize } = require("../middlewares/passport/passportConfig");

module.exports = function (app) {
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize()); //passport logic
  app.use(passport.session()); //persist across the session
  initialize(app, passport);
};
