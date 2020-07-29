const { checkAuthenticated } = require("../middlewares/requireLogin");

const {
  resetPassword,
  forgotPassword,
  newPassword,
} = require("../controllers/accountController");

/**
 * This module focuses on the endpoints related to user settings (email,password).
 * @param {*} app
 */
module.exports = (app) => {
  // @route PATCH - Resets the user's password if they are authenticated
  app.patch("/api/users/password-reset", checkAuthenticated, resetPassword);

  // @route POST - Sends an email to the user if they forgot their password
  app.post("/api/users/password-email", forgotPassword);

  /* @route PATCH - Saves the user's new password if a valid token is provided.
   ** This endpoint is referenced when a user receives an email to reset their password
   */
  app.patch("/api/users/password", newPassword);
};
