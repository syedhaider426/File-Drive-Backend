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
  // @route POST - Resets the user's password if they are authenticated
  app.post("/api/user/resetPassword", checkAuthenticated, resetPassword);

  // @route POST - Sends an email to the user if they forgot their password
  app.post("/api/user/forgotPassword", forgotPassword);

  // @route POST - Saves the user's new password if a valid token is provided.
  app.post("/api/user/newPassword", newPassword);

  // @route GET - Saves the user's new password if a valid token is provided.
  app.get("/getUser", (req, res) => {
    return res.json({ loggedIn: req.isAuthenticated() });
  });
};
