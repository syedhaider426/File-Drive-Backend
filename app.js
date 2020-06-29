//Requires in the express object
const express = require("express");

const fs = require("fs");

//Creates an instance of express
const app = express();
const port = require("./config/keys").port;

// express.json() middleware is used to pass form data into the req.body
app.use(express.json());

// express.urlencoded() middleware is used to pass objects from client to the server
app.use(express.urlencoded({ extended: true }));

//These two modules set up the middleware and then connect to the Mongo database.
require("./startup/server")(app);
require("./startup/db")();

// Module loader to initialize the routes
const routesPath = require("path").join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  require("./routes/" + file)(app);
});

// Module loader for the pages that are referenced when navigating through the website
const pagesPath = require("path").join(__dirname, "pages");
fs.readdirSync(pagesPath).forEach((file) => {
  require("./pages/" + file)(app);
});

// Returns a 404 error message if an invalid URL is entered
app.use((req, res) => {
  return res.status(404).send({ url: req.originalUrl + " could not be found" });
});

//Server listens on the designated port and logs it to the consolee
app.listen(port, () => console.log(`Connected on port ${port}`));
