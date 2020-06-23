const { checkNotAuthenticated } = require("../middlewares/requireLogin");
const { register, confirmUser } = require("../controllers/registerController");
const checkToken = require("../middlewares/requireToken");

module.exports = (app) => {
  app.post("/register", checkNotAuthenticated, register);

  app.get("/confirmRegistration", checkToken, confirmUser);
};
