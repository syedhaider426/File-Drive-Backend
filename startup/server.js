const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const passportKey = require("../config/keys").passportKey;

//https://www.freecodecamp.org/news/require-module-in-node-js-everything-about-module-require-ccccd3ad383/
//www.freecodecamp.org/news/requiring-modules-in-node-js-everything-you-need-to-know-e7fbd119be8/
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
