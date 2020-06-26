const LocalStrategy = require("passport-local").Strategy;
const user = require("./passportSerialize");

/* http://toon.io/understanding-passportjs-authentication-flow/*/

/**
 * Function sets the strategy, and the process of serializing/deserializing a user
 *
 * @param {*} app - Express object that is used to add other modules onto its middleware stack
 * @param {*} passport - Passport object used to passport properties to function
 */
initializePassport = (app, passport) => {
  /**
   * Passport allows multiple types of strategies. LocalStrategy can use
   * the authentication defined in the user.authenticate function
   */
  passport.use(
    new LocalStrategy({ usernameField: "email" }, user.authenticate)
  );
  //When a user logs in, it serializes/stores the user in req.session
  passport.serializeUser(user.serialize);

  //When a user makes a request, it deserializes/retrieves the user in req.session
  passport.deserializeUser(user.deserialize);

  console.log("Passport initialized");
};

module.exports = initializePassport;
