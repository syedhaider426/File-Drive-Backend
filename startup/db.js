const mongoose = require("mongoose");
const keys = require("../config/keys");
const db = keys.db;

module.exports = function () {
  mongoose.connect(
    db,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => console.log("Connected to DB")
  );
};
