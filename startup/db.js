const keys = require("../config/keys");
const mongoose = require("mongoose"); //ORM to interact with MongoDB
const path = require("path");
const crypto = require("crypto"); //use to generate file-names
const mongoURI = keys.db;
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

Grid.mongo = mongoose.mongo;
let gfs;

module.exports = function (app) {
  (async () => {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      console.log("Connected to GridFS");
      //Initialize stream
      gfs = Grid(mongoose.connection.db, mongoose.mongo);

      //this will create uploads.files, uploads.chunks)
      gfs.collection("uploads");

      // Create storage engine
      const storage = new GridFsStorage({
        url: mongoURI,
        file: async (req, file) => {
          return await crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return err;
            }
            const filename =
              buf.toString("hex") + path.extname(file.originalname);
            const fileInfo = {
              filename: filename,
              bucketName: "uploads", //needs to match collection name
            };
            return fileInfo;
          });
        },
      });

      const upload = multer({ storage });

      require("../routes/gridFs")(app, gfs, upload);
      require("../startup/server")(app);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })();
};
