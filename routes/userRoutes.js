const {
  checkNotAuthenticated,
} = require("../middlewares/passport/checkAuthentication");
const register = require("../controllers/registerController");

module.exports = function (app) {
  app.post("/api/register", checkNotAuthenticated, register);

  app.post("/goToLogin", (req, res) => {
    res.redirect("/login");
  });

  app.get("/register", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Register"</code></h2>
              <form action="/api/register" method="post">
                <div>Email field title: <input type="text" name="email" /></div>
                <div>Password field title: <input type="text" name="password" /></div>
                <input type="submit" value="Upload" />
              </form>
              
            `);
  });
};
