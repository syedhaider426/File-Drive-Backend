const express = require("express");
const app = express();
const port = require("./config/keys").port;
//https://stackoverflow.com/questions/47575177/express-req-body-is-empty-in-form-submission

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require("./startup/server")(app);
require("./startup/passportStartup")(app);
require("./startup/db")(app);
require("./routes/gridFs")(app);
require("./routes/userRoutes")(app);
require("./pages/pages")(app);
app.use((req, res) => {
  return res.status(404).send({ url: req.originalUrl + " could not be found" });
});
app.listen(port, () => console.log(`Connected on port ${port}`));
