// Requires in the express, fs, and path module
import express, { Request, Response, NextFunction, Application } from "express";
import fs from "fs";
import path from "path";

// Sets up the config keys
import { keys } from "./config/keys";
import { connectToDB } from "./startup/db";

// Creates an instance of express
const app: Application = express();

// express.json() middleware is used to pass form data into the req.body
// express.urlencoded() middleware is used to pass objects from client to the server
app.use(express.json()).use(express.urlencoded({ extended: true }));

// FrontEnd
app.use(
  express.static(path.join(__dirname, "../Google-Drive-Clone-FrontEnd/build"))
);

//These two modules set up the middleware and then connect to the Mongo database.
require("./startup/server")(app);
connectToDB().then(() => {
  // Module loader to initialize the routes
  const routesPath: any = require("path").join(__dirname, "routes");
  fs.readdirSync(routesPath).forEach((file) => {
    require("./routes/" + file)(app);
  });
});

// error handler middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500).json({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

//Server listens on the designated port and logs it to the consolee
app.listen(keys.port, () => console.log(`Connected on port ${keys.port}`));
