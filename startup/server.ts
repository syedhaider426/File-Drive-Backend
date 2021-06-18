import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import { keys } from "../config/keys";
import { initializePassport } from "../services/passportConfig";
import { Application, RequestHandler } from "express";

/**
 * This module configures helmet, express-session, and passport to Express middleware stack.
 * It also sets the templating engine of EJS.
 *
 * @param {*} app - Express object that is used to add other modules onto its middleware stack
 */
module.exports = function (app: Application) {
  app.use(helmet() as RequestHandler); //Sets secure http headers

  //Used to initialize custom session objects
  app.use(
    session({
      secret: keys.passportKey,
      resave: false,
      saveUninitialized: true,
    })
  );

  //Initializes passport
  app.use(passport.initialize());

  //Persist login sessions (user stays logged in)
  app.use(passport.session());

  /**
   * Functions sets the strategy, and the process of serializing/deserializing a user
   * @param {*} passport - Passport object used to passport properties to function
   */
  initializePassport(passport);
};
