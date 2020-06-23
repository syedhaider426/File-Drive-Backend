const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../middlewares/requireLogin");
const { register, confirmUser } = require("../controllers/registerController");
const {
  resetEmail,
  resetPassword,
  forgotPassword,
  newPassword,
} = require("../controllers/userController");
const checkToken = require("../middlewares/requireToken");
module.exports = (app) => {
  app.post("/register", checkNotAuthenticated, register);

  app.get("/confirmRegistration/:token", checkToken, confirmUser);

  app.post("/resetPassword", checkAuthenticated, resetPassword);

  app.post("/forgotPassword", forgotPassword);

  app.post("/newPassword", newPassword);

  app.post("/resetEmail", checkAuthenticated, resetEmail);
};
