module.exports = function (app, gfs, upload) {
  app.get("/", (req, res) => {
    gfs.files.find().toArray((err, files) => {
      //Check if files
      if (!files || files.length === 0 || err)
        res.render("index", { files: false });
      else {
        files.map((file) => {
          if (
            file.contentType === "image/jpeg" ||
            file.contentType === "image/png"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render("index", { files: files });
      }
    });
  });
  //upload.single() takes in a parameter of your file input NAME field
  app.post("/upload", upload.single("myfile"), (req, res) => {
    //res.json({ file: req.file });
    res.redirect("/");
  });

  // @route GET /files
  // @desc Display all files in JSON
  app.get("/files", (req, res) => {
    gfs.files.find().toArray((err, files) => {
      //Check if files
      if (!files || files.length === 0 || err)
        return res.status(404).json({
          err: "No files exist",
        });

      //Files exist
      return res.json(files);
    });
  });

  // @route GET /image/:filename
  // @desc Display specific image
  app.get("/image/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      //Check if files
      if (!file || file.length === 0 || err)
        return res.status(404).json({
          err: "No files exist",
        });

      //Files exist
      if (
        file.contentType === "image/jpeg" ||
        file.contentType === "image/png"
      ) {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else
        res.status(404).json({
          err: "Not an image",
        });
    });
  });

  // @route GET /files/:filename
  // @desc Display specific files in JSON
  app.get("/files/:filename", (req, res) => {
    console.log("made it here");
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      //Check if files
      if (!file || file.length === 0 || err)
        return res.status(404).json({
          err: "No files exist",
        });

      //Files exist
      return res.json(file);
    });
  });

  // @route DELETE /files/:id
  // @desc  Delete file
  app.delete("/files/:id", (req, res) => {
    gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }

      res.redirect("/");
    });
  });
};
