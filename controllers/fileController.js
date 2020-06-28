const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

exports.uploadFile = (req, res) => {
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
        isTrashed: false,
        lastUpdatedOn: new Date(),
        folder: returnObjectID(req.params.folder),
      },
    };
    let filesLength = files.length;
    console.log(files.length);
    for (let i = 0; i < filesLength; i++) {
      let writestream = Connection.gfs.openUploadStream(files[i], options);
      fs.createReadStream(paths[i]).pipe(writestream);
    }
    if (req.params.folder) return res.redirect(`/folder/${req.params.folder}`);
    else return res.redirect("/home");
  });
};

exports.getFiles = async (req, res) => {
  const files = Connection.db.collection("fs.files");
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  //https://stackoverflow.com/questions/16002659/how-to-query-nested-objects
  try {
    return await files
      .find({
        "metadata.user": req.user._id,
        "metadata.folder": returnObjectID(req.params.folder),
        "metadata.isTrashed": false,
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
  const fileArray = [];

  if (typeof req.body.files === "string")
    fileArray.push(returnObjectID(req.body.files));
  else req.body.files.forEach((file) => fileArray.push(returnObjectID(file)));
  try {
    fileArray.map(async (file) => {
      await Connection.gfs.delete(file);
    });
    res.redirect("/viewFolders");
  } catch (err) {
    console.log(err);
  }
};

exports.trashFiles = async (req, res) => {
  const fileArray = [];
  if (typeof req.body.files === "string")
    fileArray.push(returnObjectID(req.body.files));
  else req.body.files.forEach((file) => fileArray.push(returnObjectID(file)));
  //Find files and set isTrashed to true
  try {
    const result = await Connection.db.collection("fs.files").updateOne(
      {
        _id: { $in: fileArray },
      },
      {
        $set: { isTrashed: true, trashedAt: new Date() },
      }
    );
    if (!result) return res.redirect("/viewFolders");
    res.redirect("/viewFolders");
  } catch (err) {
    console.log(err);
  }
};

exports.getTrashFiles = async (req, res) => {
  const result = await Connection.db
    .collection("fs.files")
    .find({
      "metadata.user": req.user._id,
      isTrashed: true,
    })
    .toArray();
  return result;
};

exports.restoreFiles = async (req, res) => {
  const fileArray = [];
  if (typeof req.body.files === "string")
    fileArray.push(returnObjectID(req.body.files));
  else req.body.files.forEach((file) => fileArray.push(returnObjectID(file)));
  const result = await Connection.db.collection("fs.files").updateMany(
    {
      "metadata.user": req.user._id,
      _id: { $in: fileArray },
    },
    { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
  );
  if (!result) return res.redirect("/trash");
  return res.redirect("/viewFolders");
};

exports.renameFile = async (req, res) => {
  const result = await Connection.gfs.rename(
    returnObjectID(req.body.fileID),
    req.body.newName
  );
  if (!result) return res.redirect("/error");
  return res.redirect("/viewFolders");
};

exports.copyFiles = (req, res) => {
  let fileArray = [];
  let filesSelectedLength = req.body.fileID.length;
  if (filesSelectedLength === 1) {
    fileArray.push({
      id: returnObjectID(req.body.fileID),
      filename: req.body.fileName,
    });
  } else {
    for (let i = 0; i < filesSelectedLength; ++i) {
      fileArray.push({
        id: returnObjectID(req.body.fileID[i]),
        filename: req.body.fileName[i],
      });
    }
  }

  let options = {
    metadata: {
      user: req.user._id,
      lastUpdatedOn: new Date(),
      folder: returnObjectID(req.body.folder),
    },
  };
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  const gfs = Connection.gfs;
  fileArray.map((file) => {
    let downloadStream = gfs.openDownloadStream(returnObjectID(file.id));
    let writeStream = gfs.openUploadStream(`Copy of ${file.filename}`, options);
    downloadStream.pipe(writeStream).once("finish", () => {
      console.log("finished");
      res.redirect("/viewFolders");
    });
  });
};
