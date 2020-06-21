const bcrypt = require("bcrypt");
const {
  getUserById,
  getUserByEmail,
} = require("../controllers/userController");

const user = {
  serialize: (user, done) => {
    done(null, user._id);
  },
  deserialize: async (id, done) => {
    const validUser = await getUserById(id);
    return done(null, validUser);
  },
  authenticate: async (email, password, done) => {
    const user = await getUserByEmail(email);
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
  },
};

module.exports = user;
