const { checkNotAuthenticated } = require("../middlewares/requireLogin");
const {
  register,
  confirmUser,
  resendVerificationEmail,
} = require("../controllers/registerUserController");
const passport = require("passport");
const { asyncHandler } = require("../services/asyncHandler");

/**
 * This module focuses on the endpoints related to registering a user, logging in the user, and resending email verifications.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Registers a user if they are not authenticated.
  app.post("/api/users/registration", checkNotAuthenticated, register);

  // @route PATCH - Verifies the user's email if they provide the token that is sent to their email.
  app.patch("/api/users/registration-confirmation", confirmUser);

  // @route POST - Resends an confirmation email to user if they did not their confirm their account.
  app.post("/api/users/confirmation", asyncHandler(resendVerificationEmail));

  // @route POST - Logs in the user if they are not authenticated and provide the proper credentials.
  app.post("/api/users/login", checkNotAuthenticated, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) next(err);
      if (!user)
        return res.status(401).json({ error: { message: "Unable to login" } });
      req.login(user, (err) => {
        if (err) next(err);
        return res.json({ success: { message: "Logged in succesfully" } });
      });
    })(req, res, next);
  });

  // @route POST - Logout
  app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: { message: "Succesfully logged out" } });
  });
};
