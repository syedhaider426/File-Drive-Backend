const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");

createFolder = async (req, res) => {
  const db = Connection.db;
  const folders = db.collection("folders");
  const folder = {
    UserID: "",
    ParentID: "",
    Title: req.body.title,
    Description: "",
    CreatedOn: Date.now(),
    LastUpdatedOn: Date.now(),
    CreatedBy: Date.now(),
    LastUpdatedBy: Date.now(),
  };
  const result = await folders.insertOne(folder);
  if (!result)
    return res.status(404).json({ message: "Unable to create folder" });
  return res.status(200).json({ message: "Created folder" });
};

uploadFile = (req, res) => {
  var options = {
    metadata: {
      user: req.user._id,
    },
  };

  const gfs = Connection.gfs;
  //Pass in an array of files
  const form = new formidable.IncomingForm();
  (files = []), (paths = []);
  form.on("file", function (field, file) {
    files.push(file.name);
    paths.push(file.path);
  });
  form.parse(req);
  form.once("end", () => {
    // streaming to gridfs
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
      var writestream = gfs.openUploadStream(files[i], options);
      fs.createReadStream(paths[i]).pipe(writestream);
    }
  });
  return res.sendStatus(200);
};

module.exports = { createFolder, uploadFile };
