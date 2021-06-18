import { PassportStatic } from "passport";
import { Strategy } from "passport-local";
import { user } from "./passportHelpers";

/* http://toon.io/understanding-passportjs-authentication-flow/*/

/**
 * Function sets the strategy, and the process of serializing/deserializing a user
 * @param {*} passport - Passport object used to passport properties to function
 */
export const initializePassport = (passport: PassportStatic) => {
  /**
   * Passport allows multiple types of strategies. LocalStrategy can use
   * the authentication defined in the user.authenticate function
   */
  passport.use(new Strategy({ usernameField: "email" }, user.authenticate));
  //When a user logs in, it serializes/stores the user in req.session
  passport.serializeUser(user.serialize);

  //When a user makes a request, it deserializes/retrieves the user in req.session
  passport.deserializeUser(user.deserialize);
};
