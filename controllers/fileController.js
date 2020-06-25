const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

uploadFile = (req, res) => {
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
    var options = {
      metadata: {
        user: req.user._id,
        lastUpdatedOn: new Date(),
        folder: req.params.folder ? returnObjectID(req.params.folder) : "",
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
  try {
    return await files
      .find({
        "metadata.user": req.user._id,
        "metadata.folder": req.params.folder
          ? returnObjectID(req.params.folder)
          : "",
      })
      .toArray();
  } catch (err) {
    console.log(err);
  }
};

moveFiles = async (req, res) => {
  //Get file collection
  const db = Connection.db;
  const files = db.collection("fs.files");

  const fileArray = [];
  //searches for user and file in files
  if (typeof req.body.files === "string")
    fileArray.push(returnObjectID(req.body.files));
  else
    req.body.files.forEach((file) => {
      fileArray.push(returnObjectID(file));
    });
  // Need current user, folder, file
  // Need folder
  try {
    const file = files
      .update(
        {
          _id: { $in: fileArray },
          "metadata.user": returnObjectID(req.user._id),
        },
        {
          $set: {
            "metadata.folder": returnObjectID(req.body.folder)
              ? returnObjectID(req.body.folder)
              : "",
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
deleteFiles = async (req, res) => {
  //Get file collection
  const db = Connection.db;
  const files = db.collection("fs.files");
  let fileArray = [];
  //searches for user and file in files
  if (typeof req.body.files === "string")
    fileArray.push(returnObjectID(req.body.files));
  else
    req.body.files.forEach((file) => {
      fileArray.push(returnObjectID(file));
    });
  // Need current user, folder, file
  // Need folder

  try {
    const f = await files
      .find({
        _id: { $in: fileArray },
        "metadata.user": returnObjectID(req.user._id),
      })
      .project({
        _id: 1,
      })
      .toArray();
    f.map(async (file) => {
      await gfs.delete(file._id);
    });
    res.redirect("/viewFolders");
  } catch (err) {
    console.log(err);
  }
};

renameFile = async (req, res) => {
  const files = Connection.db.collection("fs.files");
  const result = await files.updatOne(
    {
      _id: req.body.fileID,
      "metadata.user": req.user._id,
    },
    {
      $set: { filename: req.body.newName },
    }
  );
  if (!result) return res.redirect("/error");
  return res.redirect("/viewFolders");
};

module.exports = { uploadFile, getFiles, moveFiles, deleteFiles, renameFile };
