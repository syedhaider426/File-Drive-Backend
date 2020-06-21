const { checkNotAuthenticated } = require("../middlewares/requireLogin");
const register = require("../controllers/registerController");

module.exports = function (app) {
  app.post("/register", checkNotAuthenticated, register);
};
