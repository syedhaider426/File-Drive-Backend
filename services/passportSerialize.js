const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const {
  getUserById,
  getUserByEmail,
} = require("../controllers/userController");

const user = {
  serialize: (user, done) => {
    done(null, user._id);
  },
  deserialize: async (id, done) => {
    try {
      const validUser = await getUserById(id);
      return done(null, validUser);
    } catch (err) {
      console.log(err);
    }
  },
  authenticate: async (email, password, done) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    try {
      await schema.validate({ email: email, password: password });
    } catch (err) {
      return done(null, false);
    }
    try {
      const user = await getUserByEmail(email);
      if (user == null) {
        return done(null, false);
      }

      if ((await bcrypt.compare(password, user.password)) && user.isVerified) {
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
