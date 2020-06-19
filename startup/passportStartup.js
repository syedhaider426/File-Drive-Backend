const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { initialize } = require("../middlewares/passport/passport-config");

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
  initialize(passport);
  require("../routes/userRoutes")(app, global.db, passport);
};
