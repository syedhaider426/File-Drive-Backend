const fs = require("fs");
const formidable = require("formidable");
const {
  checkAuthenticated,
} = require("../middlewares/passport/passport-authenticate");
module.exports = function (app, db, gfs) {
  app.get("/folder", (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/createFolder" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <input type="submit" value="Upload" />
          </form>
        `);
  });

  app.post("/api/createFolder", async (req, res) => {
    const collection = db.collection("folders");
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
    try {
      await collection.insertOne(folder);
      res.status(200).json({ message: "Created folder" });
    } catch (err) {
      res.status(404).json({ message: "Unable to create folder" });
    }
  });

  app.post("/api/upload", checkAuthenticated, (req, res) => {
    //Pass in an array of files
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) res.status(404).json({ message: err });
      // streaming to gridfs
      var writestream = gfs.createWriteStream({
        filename: files.someExpressFiles.name,
        metadata: {
          user: req.user._id,
        },
      });
      fs.createReadStream(files.someExpressFiles.path).pipe(writestream);
    });
    res.sendStatus(200);
  });
  app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + " could not be found" });
  });
};
