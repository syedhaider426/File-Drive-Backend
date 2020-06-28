const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/requireLogin");

module.exports = (app) => {
  app.get("/home", checkAuthenticated, (req, res) => {
    res.send(`
          <h2>With <code>"File Upload"</code></h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div><label class="File">File:</label> <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
          <div>
            <a href="/viewFolders">View Folders</a></div>
          <div>
            <a href="/accountSettings">Account Settings</a>
          </div>
          <div>
          <a href="/trash">View Trash</a>
        </div>
          
        `);
  });
  app.get("/", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/login" method="post" name="Login">
                <div><label class="email">Email:</label><input type="text" name="email" /></div>
                <div><label class="password">Password:</label> <input type="text" name="password" /></div>
                <button type="submit" value="Submit">Submit</button>
              </form>
              <div><label>Don't have an account? <a href="/register">Create one now.</a></div>
              <div><label>Forget password? <a href="/forgotPassword">Reset Password</a></div>
              <div><label>Resend verification email <a href="/verificationEmail">Resend</a></div>
      
            `);
  });
  app.get("/login", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Login"</code></h2>
              <form action="/login" method="post" name="Login">
                <div><label class="email">Email:</label><input type="text" name="email" /></div>
                <div><label class="password">Password:</label> <input type="text" name="password" /></div>
                <button type="submit" value="Submit">Submit</button>
              </form>
              <div><label>Don't have an account? <a href="/register">Create one now.</a></div>
              <div><label>Forget password? <a href="/forgotPassword">Reset Password</a></div>
              <div><label>Resend verification email <a href="/verificationEmail">Resend</a></div>
      
            `);
  });
  app.get("/register", checkNotAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Register"</code></h2>
              <form action="/register" method="post" name="Register">
                <div><label class="email">Email:</label><input type="text" name="email" /></div>
                <div><label class="password">Password:</label> <input type="text" name="password" /></div>
                <div><label class="confirmPassword">Confirm Password:</label> <input type="text" name="confirmPassword" /></div>
                <button type="submit" value="Register">Register</button>
              </form>
            `);
  });
  app.get("/verification", (req, res) => {
    res.send(`
                <h2>With <code>"Verification"</code></h2>
                  <div>
                    Thank you for creating an account. Please check account to verify.</label>
                  </div>
              `);
  });
  app.get("/confirmationSuccess", (req, res) => {
    res.send(`
                <h2>With <code>"Verification"</code></h2>
                  <div>
                    Thank you for verifying your account.</label>
                  </div>
              `);
  });
  app.get("/verificationEmail", (req, res) => {
    res.send(`
              <h2>With <code>"Send Email to Confirm User"</code></h2>
              <form action="/resendEmailVerification" method="post" name="resendEmailVerification">
                <div><label class="email">Current Email:</label><input type="text" name="email" /></div>     
                <button type="submit" value="Confirm">Confirm</button>
              </form>
            `);
  });
  app.get("/error", (req, res) => {
    res.send(`
            <h2>With <code>"Requested URL was not found"</code></h2>
          `);
  });
};
