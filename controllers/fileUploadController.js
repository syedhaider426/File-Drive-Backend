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
  const gfs = Connection.gfs;
  //Pass in an array of files
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(404).json({ message: err });
    // streaming to gridfs
    var options = {
      metadata: {
        user: req.user._id,
      },
    };
    var writestream = gfs.openUploadStream(
      files.someExpressFiles.name,
      options
    );
    fs.createReadStream(files.someExpressFiles.path).pipe(writestream);
  });
  return res.sendStatus(200);
};

module.exports = { createFolder, uploadFile };
