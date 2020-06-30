const { checkAuthenticated } = require("../middlewares/requireLogin");

module.exports = (app) => {
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
  app.get("/resetPassword", checkAuthenticated, (req, res) => {
    res.send(`
                <h2>With <code>"Reset Password"</code></h2>
                <form action="/api/user/resetPassword" method="post" name="ResetPassword">
                  <div><label class="currentPassword">Current Password:</label><input type="text" name="currentPassword" /></div>
                  <div><label class="newPassword">New Password:</label> <input type="text" name="newPassword" /></div>
                  <div><label class="newPassword">Confirm New Password:</label> <input type="text" name="confirmPassword" /></div>
                  <button type="submit" value="Confirm">Confirm</button>
                </form>
              `);
  });
  app.get("/resetEmail", checkAuthenticated, (req, res) => {
    res.send(`
                <h2>With <code>"Reset Email"</code></h2>
                <form action="/api/user/resetEmail" method="post" name="ResetEmail">
                  <div><label class="nEmail">New Email:</label><input type="text" name="newEmail" /></div>     
                  <button type="submit" value="Confirm">Confirm</button>
                </form>
              `);
  });
  app.get("/forgotPassword", (req, res) => {
    res.send(`
                <h2>With <code>"Send Email to Change Password"</code></h2>
                <form action="/api/user/forgotPassword" method="post" name="forgotPassword">
                  <div><label class="email">Current Email:</label><input type="text" name="email" /></div>     
                  <button type="submit" value="Confirm">Confirm</button>
                </form>
              `);
  });
  app.get("/newPassword", (req, res) => {
    let token = req.query.token;
    res.send(`
                <h2>With <code>"Reset Password"</code></h2>
                <form action="/api/user/newPassword" method="post" name="newPassword">
                  <div><label class="newPassword">New Password:</label> <input type="text" name="password" /></div>
                  <div><label class="cNewPassword">Confirm New Password:</label> <input type="text" name="confirmPassword" /></div>
                  <input type="hidden" name="token" value="${token}" />
                  <button type="submit" value="Confirm">Confirm</button>
                </form>
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
