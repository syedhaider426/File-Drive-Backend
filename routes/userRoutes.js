const bcrypt = require("bcrypt");
const {
  checkNotAuthenticated,
} = require("../middlewares/passport/checkAuthentication");
const register = require("../controllers/registerController");
module.exports = function (app) {
  app.post("/api/register", checkNotAuthenticated, register);

  app.post("/goToLogin", (req, res) => {
    res.redirect("/login");
  });
};
