import bcrypt from "bcryptjs"; //Library used to hash/decrypt passwords
import Joi, { ObjectSchema, ValidationResult } from "@hapi/joi"; //Library used to validate inputs
import { getUserById, getUserByEmail } from "../controllers/accountController";

export const user = {
  //Stores the id in the req.session.passport.user object
  serialize(user: any, done: any) {
    done(null, user._id);
  },

  /*
   * Retrieves the userid from the req.session.passport.user object
   * and stores in req.user
   */
  async deserialize(id: any, done: any) {
    try {
      //Gets the current user
      const validUser = await getUserById(id);
      return done(null, validUser);
    } catch (err) {
      done(err);
    }
  },

  //Logs the user in if they provide valid email and corresponding password
  async authenticate(email: string, password: string, done: any) {
    //Declares schema for inputs
    const schema: ObjectSchema<any> = Joi.object({
      email: Joi.string().email().required().messages({
        "string.empty": `Email cannot be empty.`,
        "string.email": `Please provide a proper email address.`,
      }),
      password: Joi.string().required().messages({
        "string.empty": `Password cannot be empty.`,
      }),
    });
    // Validate user inputs

    const validation: ValidationResult = await schema.validate({
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
