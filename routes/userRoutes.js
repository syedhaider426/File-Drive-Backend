const bcrypt = require("bcrypt");
const {
  checkNotAuthenticated,
} = require("../middlewares/passport/checkAuthentication");

module.exports = function (app, db, passport) {
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
  app.post("/api/register", checkNotAuthenticated, async (req, res) => {
    const collection = db.collection("users");
    const email = await collection.findOne({ email: req.body.email });
    if (email)
      return res
        .status(404)
        .json({ message: "User with that email already exists" });
    const password = await bcrypt.hash(req.body.password, 10);
    const result = await collection.insertOne({
      email: req.body.email,
      password: password,
    });
    if (!result) return res.status(404).json({ message: err });
    return res.redirect("/login");
  });
  app.get("/login", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/login" method="post">
                <div>Email field title: <input type="text" name="email" /></div>
                <div>Password field title: <input type="text" name="password" /></div>
                <input type="submit" value="Upload" />
              </form>
            `);
  });

  app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local"),
    (req, res) => {
      if (!req.user) return res.redirect("/login");
      return res.redirect("/");
    }
  );
};
