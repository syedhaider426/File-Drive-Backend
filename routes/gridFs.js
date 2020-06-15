const fs = require("fs");
const formidable = require("formidable");

module.exports = function (app, gfs) {
  app.get("/", (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
        `);
  });

  app.post("/api/upload", (req, res) => {
    //Pass in an array of files
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) res.status(404).json({ message: err });

      // streaming to gridfs
      var writestream = gfs.createWriteStream({
        filename: files.someExpressFiles.name,
      });
      fs.createReadStream(files.someExpressFiles.path).pipe(writestream);
    });
  });
};
