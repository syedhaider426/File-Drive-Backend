const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  file: {
    type: Buffer,
    required: true,
  },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
