const helmet = require("helmet");
const session = require("express-session");
const passportKey = require("../config/keys").passportKey;
const passport = require("passport");
const initializePassport = require("../services/passportConfig");
const { checkNotAuthenticated } = require("../middlewares/requireLogin");
//https://www.freecodecamp.org/news/require-module-in-node-js-everything-about-module-require-ccccd3ad383/
//www.freecodecamp.org/news/requiring-modules-in-node-js-everything-you-need-to-know-e7fbd119be8/

/**
 * This module configures helmet, express-session, and passport to Express middleware stack.
 * It also sets the templating engine of EJS.
 *
 * @param {*} app - Express object that is used to add other modules onto its middleware stack
 */
module.exports = function (app) {
  app.use(helmet()); //Sets secure http headers

  //Used to initialize custom session objects
  app.use(
    session({
      secret: passportKey,
      resave: false,
      saveUninitialized: true,
      name: "sessionID",
    })
  );

  //Initializes passport
  app.use(passport.initialize());

  //Persist login sessions (user stays logged in)
  app.use(passport.session());

  /**
   * Functions sets the strategy, and the process of serializing/deserializing a user
   *
   * @param {*} app - Express object that is used to add other modules onto its middleware stack
   * @param {*} passport - Passport object used to passport properties to function
   */
  initializePassport(app, passport);

  //Sets the templating engine to ejs
  app.set("view engine", "ejs");
};
