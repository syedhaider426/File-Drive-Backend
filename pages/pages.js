const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/requireLogin");
const checkToken = require("../middlewares/requireToken");

module.exports = function (app) {
  app.get("/home", checkAuthenticated, (req, res) => {
    res.send(`
          <h2>With <code>"File Upload"</code></h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div><label class="File">File:</label> <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>

          <div>
            <a href="/accountSettings">Account Settings</a>
          </div>
          
        `);
  });
  app.get("/accountSettings", checkAuthenticated, (req, res) => {
    res.send(`
          <h2>With <code>"Account Settings"</code></h2>
          <div>
            <a href="/resetPassword">Reset Password</a>
          </div>

          <div>
            <a href="/resetEmail">Reset Email</a>
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
  app.get("/resetPassword", checkAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Reset Password"</code></h2>
              <form action="/resetPassword" method="post" name="ResetPassword">
                <div><label class="currentPassword">Current Password:</label><input type="text" name="currentPassword" /></div>
                <div><label class="newPassword">New Password:</label> <input type="text" name="password" /></div>
                <div><label class="newPassword">Confirm New Password:</label> <input type="text" name="confirmPassword" /></div>
                <button type="submit" value="Confirm">Confirm</button>
              </form>
            `);
  });
  app.get("/resetEmail", checkAuthenticated, (req, res) => {
    res.send(`
              <h2>With <code>"Reset Email"</code></h2>
              <form action="/resetEmail" method="post" name="ResetEmail">
                <div><label class="email">Current Email:</label><input type="text" name="email" /></div>     
                <div><label class="nEmail">New Email:</label><input type="text" name="newEmail" /></div>     
                <button type="submit" value="Confirm">Confirm</button>
              </form>
            `);
  });
  app.get("/forgotPassword", (req, res) => {
    res.send(`
              <h2>With <code>"Send Email to Change Password"</code></h2>
              <form action="/forgotPassword" method="post" name="forgotPassword">
                <div><label class="email">Current Email:</label><input type="text" name="email" /></div>     
                <button type="submit" value="Confirm">Confirm</button>
              </form>
            `);
  });
  app.get("/newPassword", checkToken, (req, res) => {
    res.send(`
              <h2>With <code>"Reset Password"</code></h2>
              <form action="/newPassword" method="post" name="newPassword">
                <div><label class="newPassword">New Password:</label> <input type="text" name="password" /></div>
                <div><label class="cNewPassword">Confirm New Password:</label> <input type="text" name="confirmPassword" /></div>
                <input type="hidden" name="token" value="0abca4291124e6eb6dadf436f67cd451" />
                <button type="submit" value="Confirm">Confirm</button>
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
              <h2>With <code>"Confirmation for Account Registration"</code></h2>
                <div>
                  Your account has been successfully registered.
                </div>
            `);
  });
  app.get("/passwordChangeSuccess", (req, res) => {
    res.send(`
              <h2>With <code>"Confirmation for Password Change"</code></h2>
                <div>
                  Your password has been successfully changed. Please login.
                </div>
                <form action="/">
                <input type="submit" value="Login" />
               </form>
            `);
  });
  app.get("/emailSentConfirmation", (req, res) => {
    res.send(`
              <h2>With <code>"Confirmation for Email Sent"</code></h2>
                <div>
                  Please check your email to reset your password.
                </div>
            `);
  });
};
