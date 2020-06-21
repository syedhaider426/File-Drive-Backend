const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/requireLogin");

module.exports = function (app) {
  app.get("/file", checkAuthenticated, (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div><label class="File">File:</label> <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
          
        `);
  });
  app.get("/", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/login" method="post" name="Login">
                <div><label class="email">Email:   </label><input type="text" name="email" /></div>
                <div><label class="password">Password:  </label> <input type="text" name="password" /></div>
                <button type="submit" value="Submit">Submit</button>
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
};
