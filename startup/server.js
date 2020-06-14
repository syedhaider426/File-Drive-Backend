const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");

module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.set("view engine", "ejs");
  require("../routes/fileRoutes")(app);
  app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + " not found" });
  });
};
