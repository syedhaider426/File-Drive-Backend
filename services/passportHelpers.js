const bcrypt = require("bcrypt"); //Library used to hash/decrypt passwords
const Joi = require("@hapi/joi"); //Library used to validate inputs
const {
  getUserById,
  getUserByEmail,
} = require("../controllers/accountController");

const user = {
  //Stores the id in the req.session.passport.user object
  serialize(user, done) {
    done(null, user._id);
  },

  /*
   * Retrieves the userid from the req.session.passport.user object
   * and stores in req.user
   */
  async deserialize(id, done) {
    try {
      //Gets the current user
      const validUser = await getUserById(id);
      return done(null, validUser);
    } catch (err) {
      done(err);
    }
  },

  //Logs the user in if they provide valid email and corresponding password
  async authenticate(email, password, done) {
    //Declares schema for inputs
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.empty": `Email cannot be empty.`,
        "string.email": `Please provide a proper email address.`,
      }),
      password: Joi.string().required().messages({
        "string.empty": `Password cannot be empty.`,
      }),
    });
    // Validate user inputs

    const validation = await schema.validate({
      email,
      password,
    });
    // Return error if any inputs do not satisfy the schema
    if (validation.error) return done(null, false);

    try {
      //Finds user based off their email
      const user = await getUserByEmail(email);
      //If it's not found, do not let user login
      if (user == null) {
        return done(null, false);
      }

      /* If user is found, check the user entered the correct password and has
       * confirmed their account; else, do not let user login
       */
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
