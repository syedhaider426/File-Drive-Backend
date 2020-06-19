const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("../middlewares/passport-config");
module.exports = function (app, db) {
  app.use(helmet());
  app.use(cors());
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
    })
  );
  initializePassport(passport, getUserByEmail, getUserById);
  app.use(passport.initialize()); //passport logic
  app.use(passport.session()); //persist across the session
  //require("../routes/userRoutes")(app, db, passport);
  app.set("view engine", "ejs");
  app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + " not found" });
  });
};
