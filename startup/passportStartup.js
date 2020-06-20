const session = require("express-session");
const passport = require("passport");
const { initialize } = require("../middlewares/passport/passportConfig");
const passportKey = require("../config/keys").passportKey;

module.exports = function (app) {
  app.use(
    session({
      secret: passportKey,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize()); //passport logic
  app.use(passport.session()); //persist across the session
  initialize(app, passport);
};
