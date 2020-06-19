const helmet = require("helmet");
const cors = require("cors");
const {
  checkNotAuthenticated,
} = require("../middlewares/passport/checkAuthentication");
module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.get("/file", (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
          
        `);
  });
  app.get("/", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/goToLogin" method="post">
                <input type="submit" value="Login" />
              </form>
            `);
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

  app.set("view engine", "ejs");
};
