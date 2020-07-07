const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

generateFileArray = (req) => {
  const files = [];
  if (req.body.selectedFiles.length > 0)
    req.body.selectedFiles.forEach((file) => {
      files.push(returnObjectID(file.id));
    });
  return files;
};

generateFolderArray = (req) => {
  const folders = [];
  if (req.body.selectedFolders.length > 0)
    req.body.selectedFolders.forEach((folder) => {
      folders.push(returnObjectID(folder.id));
    });
  return folders;
};

exports.uploadFile = (req, res, next) => {
  //Pass in an array of files
  const form = new formidable.IncomingForm();
  const options = {
    metadata: {
      user_id: req.user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.params.folder),
    },
  };
  // File has been received
  form.on("file", (field, file) => {
    const writestream = Connection.gfs.openUploadStream(file.name, options);
    fs.createReadStream(file.path).pipe(writestream);
  });

  //This is necessary to trigger the events
  form.parse(req);

  // If an error occurs, return an error response back to the client
  form.on("error", (err) => {
    next(err);
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

exports.getFilesAndFolders = async (req, res, next) => {
  try {
    //Return the files for the specific user
    const files = await Connection.db
      .collection("fs.files")
      .find({
        "metadata.user_id": req.user._id,
        "metadata.folder_id": returnObjectID(req.params.folder),
        "metadata.isTrashed": false,
      })
      .toArray();
    const folders = await Connection.db
      .collection("folders")
      .find({ user_id: req.user._id, isTrashed: false })
      .toArray();
    const result = {
      files,
      folders,
    };
    return res.json(result);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.getTrashFilesAndFolders = async (req, res, next) => {
  try {
    // Return the files that are in the user's trash
    const files = await Connection.db
      .collection("fs.files")
      .find({
        "metadata.user_id": req.user._id,
        "metadata.isTrashed": true,
      })
      .toArray();
    const folders = await Connection.db
      .collection("folders")
      .find({
        user_id: req.user._id,
        isTrashed: true,
      })
      .toArray();
    const result = { files, folders };
    return res.json(result);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the trashed file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.getFavoriteFilesAndFolders = async (req, res, next) => {
  try {
    // Finds the files that the user favorited
    const files = await Connection.db
      .collection("fs.files")
      .find({
        "metadata.user_id": req.user._id,
        isFavorited: true,
        "metadata.isTrashed": false,
      })
      .toArray();
    const folders = await Connection.db
      .collection("folders")
      .find({
        user_id: req.user._id,
        isFavorited: true,
        isTrashed: false,
      })
      .toArray();
    const result = { files, folders };
    res.json(result);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the favorited file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.moveFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFileArray(req);

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
    else next(err);
  }
};

/* https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop */
/* https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach*/
/* https://dev.to/jamesliudotcc/how-to-use-async-await-with-map-and-promise-all-1gb5 */
exports.deleteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFileArray(req);

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
      else next(err);
    });
};

exports.trashFilesAndFolders = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  const folders = generateFolderArray(req);
  try {
    /*
     * Trash the files
     * **NOTE**: trashedAt is a new field that gets added to each document. It has an index on it that
     * will expire after 30 days, therefore, deleting the folder and file
     */
    let trashedFiles;
    let trashedFolders;
    let currentFiles = [];
    let currentFolders = [];

    /**
     * Trash files
     */
    if (files.length > 0) {
      trashedFiles = await Connection.db.collection("fs.files").updateMany(
        { _id: { $in: files } },
        {
          $set: { "metadata.isTrashed": true, trashedAt: new Date() },
        }
      );
      if (trashedFiles.result.nModified > 0)
        //Return the files for the specific user
        currentFiles = await Connection.db
          .collection("fs.files")
          .find({
            "metadata.user_id": req.user._id,
            "metadata.folder_id": returnObjectID(req.body.folder),
            "metadata.isTrashed": false,
          })
          .toArray();
    }

    /**
     * Trash folders
     */
    if (folders.length > 0) {
      trashedFolders = await Connection.db.collection("folders").updateMany(
        {
          _id: { $in: folders },
        },
        {
          $set: { isTrashed: true, trashedAt: new Date() },
        }
      );
      if (trashedFolders.result.nModified > 0)
        //Return the folders for the specific user
        currentFolders = await Connection.db
          .collection("folders")
          .find({
            user_id: req.user._id,
            parent_id: returnObjectID(req.body.folder),
            isTrashed: false,
          })
          .toArray();
    }
    return res.json({
      files: currentFiles,
      folders: currentFolders,
      success: {
        message: "Files/folders were succesfully trashed",
      },
    });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error trashing the selected file(s) or folder(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.restoreFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  try {
    const restoredFiles = await Connection.db.collection("fs.files").updateMany(
      {
        "metadata.user_id": req.user._id,
        _id: { $in: files },
      },
      { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
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
    else next(err);
  }
};

exports.renameFile = async (req, res, next) => {
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
    else next(err);
  }
};

exports.copyFiles = (req, res, next) => {
  const files = [];
  const filesSelectedLength = req.body.selectedFiles.length;
  // Pushes the files id and name into the 'files' array
  for (let i = 0; i < filesSelectedLength; ++i) {
    files.push({
      id: returnObjectID(req.body.selectedFiles[i].id),
      filename: req.body.selectedFiles[i].filename,
    });
  }
  const options = {
    metadata: {
      user_id: req.user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.body.folder),
    },
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
    let id = writeStream.id;
    // Bytes get downloaded and written into the writestream
    downloadStream.pipe(writeStream).once("finish", async () => {
      try {
        const files = await Connection.db
          .collection("fs.files")
          .find({ _id: id })
          .toArray();
        return res.json({
          success: {
            message: "Files were sucessfully copied",
          },
          files: files,
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
        else next(err);
      }
    });
  });
};

exports.favoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be favorited
  const files = generateFileArray(req);

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
    else next(err);
  }
};

exports.unfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);

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
    else next(err);
  }
};
