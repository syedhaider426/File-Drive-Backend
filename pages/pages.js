const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/passport/checkAuthentication");

module.exports = function (app) {
  app.get("/file", checkAuthenticated, (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
          
        `);
  });
  app.get("/login", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/login" method="post">
                <div><label class="email">Email: <input type="text" name="email" /></label></div>
                <div><label class="password">Password: <input type="text" name="password" /></label></div>
                <input type="submit" value="Upload" />
              </form>
            `);
  });
};
