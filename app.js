const express = require("express");
const app = express();
const keys = require("./config/keys");
const port = keys.port;

//https://stackoverflow.com/questions/47575177/express-req-body-is-empty-in-form-submission

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./startup/db")(app);

app.listen(port, () => console.log(`Connected on port ${port}`));
