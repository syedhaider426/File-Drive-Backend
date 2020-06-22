const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");

uploadFile = (req, res) => {
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
    var options = {
      metadata: {
        user: req.user._id,
      },
    };
    for (let i = 0; i < files.length; i++) {
      let writestream = gfs.openUploadStream(files[i], options);
      fs.createReadStream(paths[i]).pipe(writestream);
    }
  });
  return res.sendStatus(200);
};

module.exports = uploadFile;
