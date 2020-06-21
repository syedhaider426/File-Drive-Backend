const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");

module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.set("view engine", "ejs");
};
