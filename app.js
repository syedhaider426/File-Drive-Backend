const express = require("express");
const app = express();
const keys = require("./config/keys");
const port = keys.port;

require("./startup/server")(app);
require("./startup/db")();

app.listen(port, () => console.log(`Connected on port ${port}`));
