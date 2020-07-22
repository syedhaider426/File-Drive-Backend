// Sets up the config keys and requires in the SendGrid API
const keys = require("./config/keys");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(keys.sendgrid_api_key);

// Requires in the express and fs module
const express = require("express");
const fs = require("fs");

// Creates an instance of express
const app = express();

const port = keys.port;

// express.json() middleware is used to pass form data into the req.body
// express.urlencoded() middleware is used to pass objects from client to the server
app.use(express.json()).use(express.urlencoded({ extended: true }));

//These two modules set up the middleware and then connect to the Mongo database.
require("./startup/server")(app);
require("./startup/db")();

// Module loader to initialize the routes
const routesPath = require("path").join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  require("./routes/" + file)(app);
});

app.use((req, res, next) => {
  const error = new Error(`${req.originalUrl} was not found`);
  error.status = 404;
  next(error);
});

// error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

//Server listens on the designated port and logs it to the consolee
app.listen(port, () => console.log(`Connected on port ${port}`));

// If there is an uncaught exception, send error stack to email
process.on("uncaughtException", async (err) => {
  // Set mail content for SendGrid to send
  const mailOptions = {
    from: keys.email,
    to: keys.email,
    subject: "****ERROR WITH****** - GDrive Clone",
    text: new Date().toUTCString() + `${err.message}` + "\n\n" + err.stack,
  };

  // Send email via SendGrid
  await sgMail.send(mailOptions);

  // Close instance (which will be restarted by PM2 after it is closed)
  process.exit(1);
});
