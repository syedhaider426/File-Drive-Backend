const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const mongodb = require("mongodb");
uploadFile = (req, res) => {
  const db = Connection.db;
  const gfs = Connection.gfs;
  //Pass in an array of files
  const form = new formidable.IncomingForm();
  (files = []), (paths = []);
  form.on("file", (field, file) => {
    files.push(file.name);
    paths.push(file.path);
  });
  form.parse(req);
  form.once("end", () => {
    // streaming to gridfs
    let folderID = "";
    if (req.params.folder) folderID = new mongodb.ObjectID(req.params.folder);
    var options = {
      metadata: {
        user: req.user._id,
        folder: folderID,
      },
    };
    for (let i = 0; i < files.length; i++) {
      let writestream = gfs.openUploadStream(files[i], options);
      fs.createReadStream(paths[i]).pipe(writestream);
    }
    if (req.params.folder) return res.redirect(`/folder/${req.params.folder}`);
    else return res.redirect("/home");
  });
};

getFiles = async (req, res) => {
  const db = Connection.db;
  const files = db.collection("fs.files");
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  //https://stackoverflow.com/questions/16002659/how-to-query-nested-objects
  return files
    .find({
      metadata: {
        user: req.user._id,
        folder: req.params.folder
          ? new mongodb.ObjectID(req.params.folder)
          : "",
      },
    })
    .toArray();
};

module.exports = { uploadFile, getFiles };
