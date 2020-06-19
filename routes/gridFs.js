const fs = require("fs");
const formidable = require("formidable");
const {
  checkAuthenticated,
} = require("../middlewares/passport/checkAuthentication");

module.exports = function (app, db, gfs) {
  app.post("/api/createFolder", async (req, res) => {
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
  });

  app.post("/api/upload", checkAuthenticated, (req, res) => {
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
  });
};
