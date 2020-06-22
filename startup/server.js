const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const passportKey = require("../config/keys").passportKey;
module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.use(
    session({
      secret: passportKey,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.set("view engine", "ejs");
};
