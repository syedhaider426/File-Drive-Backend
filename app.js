//Requires in the express object
const express = require("express");

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

// These four modules initialize the routes
require("./routes/fileRoutes")(app);
require("./routes/folderRoutes")(app);
require("./routes/registerRoutes")(app);
require("./routes/accountSettingRoutes")(app);

// These three modules are the pages that are referenced when navigating through the website
require("./pages/mainPages")(app);
require("./pages/accountSettingsPages")(app);
require("./pages/folderPages")(app);

// Returns a 404 error message if an invalid URL is entered
app.use((req, res) => {
  return res.status(404).send({ url: req.originalUrl + " could not be found" });
});

//Server listens on the designated port and logs it to the consolee
app.listen(port, () => console.log(`Connected on port ${port}`));
