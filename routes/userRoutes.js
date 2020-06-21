const { checkNotAuthenticated } = require("../middlewares/requireLogin");
const register = require("../controllers/registerController");

module.exports = function (app) {
  app.post("/api/register", checkNotAuthenticated, register);
};
