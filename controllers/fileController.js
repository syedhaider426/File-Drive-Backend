const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

generateFileArray = (req) => {
  const files = [];

  /* If only one file is selected, the type of the fileID is a string; otherwise
   * if two or more files are selected, it will be an array
   */
  if (typeof req.body.fileID === "string")
    files.push(returnObjectID(req.body.fileID));
  else
    req.body.fileID.forEach((file) => {
      files.push(returnObjectID(file));
    });
  return files;
};

exports.uploadFile = (req, res) => {
  //Pass in an array of files
  const form = new formidable.IncomingForm();
  const options = {
    user_id: req.user._id,
    isTrashed: false,
    folder_id: returnObjectID(req.params.folder),
  };

  // File has been received
  form.on("file", (field, file) => {
    const writestream = Connection.gfs.openUploadStream(file.name, options);
    fs.createReadStream(file.path).pipe(writestream);
  });

  // If an error occurs, return an error response back to the client
  form.on("error", (err) => {
    return res.status(404).json(err);
  });

  // Once it is finishing parsing the file, upload the file to GridFSBucket
  form.once("end", () => {
    return res.json({
      success: {
        message: "Files were sucessfully uploaded",
      },
    });
  });
};

exports.getFiles = async (req, res) => {
  try {
    // Return the files for the specific user
    return await Connection.db
      .collection("fs.files")
      .find({
        user_id: req.user._id,
        folder_id: returnObjectID(req.params.folder),
        isTrashed: false,
      })
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.getTrashFiles = async (req, res) => {
  try {
    // Return the files that are in the user's trash
    return await Connection.db
      .collection("fs.files")
      .find({
        user_id: req.user._id,
        isTrashed: true,
      })
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the trashed file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.getFavoriteFiles = async (req, res) => {
  try {
    // Finds the files that the user favorited
    return await Connection.db
      .collection("fs.files")
      .find({
        user_id: req.user._id,
        isFavorited: true,
        isTrashed: false,
      })
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the favorited file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.moveFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFolderArray(req);

  try {
    const movedFiles = await Connection.db
      .collection("fs.files")
      .update(
        {
          _id: { $in: files },
        },
        {
          $set: {
            folder_id: returnObjectID(req.body.folder),
          },
        }
      )
      .toArray();
    if (movedFiles.result.nModified > 0)
      return res.json({
        success: {
          message: "Files were successfully moved",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error moving the file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

/* https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop */
/* https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach*/
/* https://dev.to/jamesliudotcc/how-to-use-async-await-with-map-and-promise-all-1gb5 */
exports.deleteFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFolderArray(req);

  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  Promise.all(deletedFilesPromise)
    .then(() => {
      return res.json({
        success: {
          message: "All selected files were deleted succesfully",
        },
      });
    })
    .catch((err) => {
      // If there is an error with Mongo, throw an error
      if (err.name === "MongoError")
        return res.status(404).json({
          error: {
            message:
              "There was an error deleting the selected file(s). Please try again.",
          },
        });
      else return res.status(404).json(err);
    });
};

exports.trashFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFolderArray(req);

  try {
    /*
     * Trash the files
     * **NOTE**: trashedAt is a new field that gets added to each document. It has an index on it that
     * will expire after 30 days, therefore, deleting the folder and file
     */
    const trashedFiles = await Connection.db.collection("fs.files").updateOne(
      {
        _id: { $in: files },
      },
      {
        $set: { isTrashed: true, trashedAt: new Date() },
      }
    );
    if (trashedFiles.result.nModified > 0)
      return res.json({
        success: {
          message: "Files were succesfully trashed",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error trashing the selected file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.restoreFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFolderArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  try {
    const restoredFiles = await Connection.db.collection("fs.files").updateMany(
      {
        user_id: req.user._id,
        _id: { $in: files },
      },
      { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
    );
    if (restoredFiles.result.nModified > 0)
      return res.json({
        success: {
          message: "Files were succesfully restored",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error restoring the selected file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.renameFile = async (req, res) => {
  try {
    // Finds file and renames it
    const renamedFile = await Connection.gfs.rename(
      returnObjectID(req.body.fileID),
      req.body.newName
    );
    if (renamedFile.result.nModified > 0)
      return res.json({
        success: {
          message: "File was sucessfully renamed",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error restoring the selected file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.copyFiles = (req, res) => {
  const files = [];
  const filesSelectedLength = req.body.fileID.length;

  // Pushes the files id and name into the 'files' array
  if (filesSelectedLength === 1) {
    files.push({
      id: returnObjectID(req.body.fileID),
      filename: req.body.fileName,
    });
  } else {
    for (let i = 0; i < filesSelectedLength; ++i) {
      files.push({
        id: returnObjectID(req.body.fileID[i]),
        filename: req.body.fileName[i],
      });
    }
  }

  const options = {
    user_id: req.user._id,
    folder_id: returnObjectID(req.body.folder),
  };
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  files.map((file) => {
    // Downloads the file from the GridFSBucket
    const downloadStream = Connection.gfs.openDownloadStream(
      returnObjectID(file.id)
    );

    // Uploads the file to GridFSBucket
    const writeStream = Connection.gfs.openUploadStream(
      `Copy of ${file.filename}`,
      options
    );

    // Bytes get downloaded and written into the writestream
    downloadStream.pipe(writeStream).once("finish", () => {
      return res.json({
        success: {
          message: "Files were sucessfully copied",
        },
      });
    });
  });
};

exports.favoriteFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be favorited
  const files = generateFolderArray(req);

  try {
    const favoritedFiles = await Connection.db
      .collection("fs.files")
      .updateMany({ _id: { $in: files } }, { $set: { isFavorited: true } });
    if (favoritedFiles.result.nModified > 0)
      return res.json({
        success: {
          message: "File was sucessfully renamed",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error restoring the selected file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.unfavoriteFiles = async (req, res) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFolderArray(req);

  try {
    const unfavoritedFiles = await Connection.db
      .collection("fs.files")
      .updateMany({ _id: { $in: files } }, { $set: { isFavorited: false } });
    if (unfavoritedFiles.result.nModified > 0)
      return res.json({
        success: {
          message: "Files were sucessfully unfavorited",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error restoring the selected file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};
