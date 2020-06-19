const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { getUserById, getUserByEmail } = require("../userUtils/userUtils");

/* http://toon.io/understanding-passportjs-authentication-flow/*/
function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const validUser = await getUserByEmail(email);
    const user = validUser[0];
    if (user == null) {
      return done(null, false);
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    const validUser = await getUserById(id);
    const user = validUser[0];
    return done(null, user);
  });
}

module.exports = initialize;
