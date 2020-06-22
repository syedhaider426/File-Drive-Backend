const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../middlewares/requireLogin");
const { register, confirmUser } = require("../controllers/registerController");
const { resetEmail, resetPassword } = require("../controllers/userController");

module.exports = function (app) {
  app.post("/register", checkNotAuthenticated, register);

  app.get("/confirmation/:token", confirmUser);

  app.post("/resetPassword", checkAuthenticated, resetPassword);

  app.post("/resetEmail", checkAuthenticated, resetEmail);
};
