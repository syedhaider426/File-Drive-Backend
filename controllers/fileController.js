const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

exports.uploadFile = (req, res) => {
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
    let options = {
      metadata: {
        user: req.user._id,
        lastUpdatedOn: new Date(),
        folder: returnObjectID(req.params.folder),
      },
    };
    let filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      let writestream = gfs.openUploadStream(files[i], options);
      fs.createReadStream(paths[i]).pipe(writestream);
    }
    if (req.params.folder) return res.redirect(`/folder/${req.params.folder}`);
    else return res.redirect("/home");
  });
};

exports.getFiles = async (req, res) => {
  const db = Connection.db;
  const files = db.collection("fs.files");
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  //https://stackoverflow.com/questions/16002659/how-to-query-nested-objects
  try {
    return await files
      .find({
        "metadata.user": returnObjectID(req.user._id),
        "metadata.folder": returnObjectID(req.params.folder),
      })
      .toArray();
  } catch (err) {
    console.log(err);
  }
};

exports.moveFiles = async (req, res) => {
  //Get file collection
  const db = Connection.db;
  const files = db.collection("fs.files");
  const fileArray = [];

  req.body.files.forEach((file) => {
    fileArray.push(returnObjectID(file));
  });
  try {
    files
      .update(
        {
          _id: { $in: fileArray },
        },
        {
          $set: {
            "metadata.folder": returnObjectID(req.body.folder),
          },
        }
      )
      .toArray()
      .then((res) => {
        if (!res) return res.redirect("/home");
        return res.redirect("/viewFolders");
      });
  } catch (err) {
    console.log(err);
  }

  //updates the folder field
};

/* https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop */
/* https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach*/
/* https://dev.to/jamesliudotcc/how-to-use-async-await-with-map-and-promise-all-1gb5 */
exports.deleteFiles = async (req, res) => {
  //Get file collection
  const db = Connection.db;
  const files = db.collection("fs.files");
  let fileArray = [];

  req.body.files.forEach((file) => {
    fileArray.push(returnObjectID(file));
  });

  try {
    fileArray.map(async (file) => {
      await gfs.delete(file._id);
      res.redirect("/viewFolders");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.renameFile = async (req, res) => {
  const gfs = Connection.gfs;
  const result = await gfs.rename(
    returnObjectID(req.body.fileID),
    req.body.newName
  );
  if (!result) return res.redirect("/error");
  return res.redirect("/viewFolders");
};

exports.copyFile = (req, res) => {
  const gfs = Connection.gfs;
  let fileArray = [];
  let filesSelectedLength = req.body.fileID.length;

  for (let i = 0; i < filesSelectedLength; ++i) {
    fileArray.push({
      id: returnObjectID(req.body.fileID[i]),
      filename: req.body.fileName[i],
    });
  }

  let options = {
    metadata: {
      user: req.user._id,
      lastUpdatedOn: new Date(),
      folder: returnObjectID(req.body.folder),
    },
  };
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  fileArray.map((file) => {
    let downloadStream = gfs.openDownloadStream(returnObjectID(file.id));
    let writeStream = gfs.openUploadStream(`Copy of ${file.filename}`, options);
    downloadStream.pipe(writeStream).once("finish", () => {
      console.log("finished");
      res.redirect("/viewFolders");
    });
  });
};
