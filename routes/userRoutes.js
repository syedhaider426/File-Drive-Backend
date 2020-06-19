const bcrypt = require("bcrypt");
module.exports = function (app, db, passport) {
  app.get("/register", (req, res) => {
    res.send(`
              <h2>With <code>"Register"</code></h2>
              <form action="/api/register" method="post">
                <div>Email field title: <input type="text" name="email" /></div>
                <div>Password field title: <input type="text" name="password" /></div>
                <input type="submit" value="Upload" />
              </form>
              
            `);
  });
  app.post("/api/register", async (req, res) => {
    const collection = db.collection("users");
    try {
      const password = await bcrypt.hash(req.body.password, 10);
      await collection.insertOne({ email: req.body.email, password: password });
      res.redirect("/login");
    } catch (err) {
      res.status(404).json({ message: err });
    }
  });
  app.get("/login", (req, res) => {
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
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  );
};
