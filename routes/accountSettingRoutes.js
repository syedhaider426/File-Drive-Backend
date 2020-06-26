const { checkAuthenticated } = require("../middlewares/requireLogin");
const checkToken = require("../middlewares/requireToken");
const {
  resetEmail,
  resetPassword,
  forgotPassword,
  newPassword,
} = require("../controllers/userSettingsController");

/**
 * This module focuses on the endpoints related to user settings (email,password).
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Resets the user's password if they are authenticated
  app.post("/resetPassword", checkAuthenticated, resetPassword);

  // @route POST - Resets the user's email if they are authenticated
  app.post("/resetEmail", checkAuthenticated, resetEmail);

  // @route POST - Sends an email to the user if they forgot their password
  app.post("/forgotPassword", forgotPassword);

  // @route POST - Saves the user's new password if a valid token is provided.
  app.post("/newPassword", checkToken, newPassword);
};
