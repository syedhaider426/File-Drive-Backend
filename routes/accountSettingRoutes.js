const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  resetEmail,
  resetPassword,
  forgotPassword,
  newPassword,
} = require("../controllers/userSettingsController");

module.exports = (app) => {
  app.post("/resetPassword", checkAuthenticated, resetPassword);

  app.post("/resetEmail", checkAuthenticated, resetEmail);

  app.post("/forgotPassword", forgotPassword);

  app.post("/newPassword", newPassword);
};
