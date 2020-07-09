const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");
const {
  trashFolders,
  deleteFolders,
  restoreFolders,
  favoriteFolders,
  unfavoriteFolders,
} = require("./folderController");

const { createFiles, findFiles, updateFiles } = require("../database/crud");

generateFileArray = (req) => {
  const files = [];
  if (req.body.selectedFiles.length > 0)
    req.body.selectedFiles.forEach((file) => {
      files.push(returnObjectID(file.id));
    });
  return files;
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
  createFiles(req, options);
};

exports.getFilesAndFolders = async (req, res, next) => {
  //Return the files for the specific user
  const files = await findFiles({
    "metadata.user_id": req.user._id,
    "metadata.folder_id": returnObjectID(req.params.folder),
    "metadata.isTrashed": false,
  });
  const folders = await findFolders({
    user_id: req.user._id,
    isTrashed: false,
  });
  const result = {
    files,
    folders,
  };
  return res.json(result);
};

exports.getTrashFilesAndFolders = async (req, res, next) => {
  // Return the files that are in the user's trash
  const files = await findFiles({
    "metadata.user_id": req.user._id,
    "metadata.isTrashed": true,
  });
  const folders = await findFolders({
    user_id: req.user._id,
    isTrashed: true,
  });
  const result = { files, folders };
  return res.json(result);
};

exports.getFavoriteFilesAndFolders = async (req, res, next) => {
  // Finds the files that the user favorited
  const files = await findFiles({
    "metadata.user_id": req.user._id,
    isFavorited: true,
    "metadata.isTrashed": false,
  });
  const folders = await findFolders({
    user_id: req.user._id,
    isFavorited: true,
    isTrashed: false,
  });
  const result = { files, folders };
  res.json(result);
};

/* https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop */
/* https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach*/
/* https://dev.to/jamesliudotcc/how-to-use-async-await-with-map-and-promise-all-1gb5 */
exports.deleteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFileArray(req);
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.isTrashed": true,
    });
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return await Connection.db.collection("fs.files").find({
        "metadata.user_id": req.user._id,
        "metadata.isTrashed": true,
      });
    })
    .catch((err) => {
      // If there is an error with Mongo, throw an error
      if (err.name === "MongoError")
        return res.status(404).json({
          error: {
            message:
              "There was an error deleting the selected file(s)/folder(s). Please try again.",
          },
        });
      else next(err);
    });
};

exports.deleteFilesAndFolders = async (req, res, next) => {
  const files = await this.deleteFiles(req, res, next);
  const folders = await deleteFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Files/folders were succesfully deleted",
    },
  });
};

exports.trashFiles = async (req, res, next) => {
  const files = generateFileArray(req);
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.body.folder),
      "metadata.isTrashed": false,
    });
  /*
   * Trash the files
   * **NOTE**: trashedAt is a new field that gets added to each document. It has an index on it that
   * will expire after 30 days, ther
   * efore, deleting the folder and file
   */
  let trashedFiles = await updateFiles(
    { _id: { $in: files } },
    {
      $set: {
        "metadata.isTrashed": true,
        trashedAt: new Date(),
        isFavorited: false,
      },
    }
  );
  if (trashedFiles.result.nModified > 0)
    //Return the files for the specific user
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.body.folder),
      "metadata.isTrashed": false,
    });
};

exports.trashFilesAndFolders = async (req, res, next) => {
  const files = await this.trashFiles(req, res, next);
  const folders = await trashFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Files/folders were succesfully trashed",
    },
  });
};

exports.restoreFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.isTrashed": true,
    });
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.isTrashed": true,
    });
};

exports.restoreFilesAndFolders = async (req, res, next) => {
  const files = await this.restoreFiles(req, res, next);
  const folders = await restoreFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully restored" },
  });
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
  const gfs = Connection.gfs;
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  files.map((file) => {
    // Downloads the file from the GridFSBucket
    const downloadStream = gfs.openDownloadStream(returnObjectID(file.id));

    // Uploads the file to GridFSBucket
    const writeStream = gfs.openUploadStream(
      `Copy of ${file.filename}`,
      options
    );
    let id = writeStream.id;
    // Bytes get downloaded and written into the writestream
    downloadStream.pipe(writeStream).once("finish", async () => {
      const files = await findFiles({ _id: id });
      return res.json({
        files,
        success: {
          message: "Files were sucessfully copied",
        },
      });
    });
  });
};

exports.favoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be favorited
  const files = generateFileArray(req);
  if (files.length === 0)
    return await Connection.db.collection("fs.files").find({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": false,
    });
  try {
    const favoritedFiles = await Connection.db
      .collection("fs.files")
      .updateMany({ _id: { $in: files } }, { $set: { isFavorited: true } });
    if (favoritedFiles.result.nModified > 0)
      return await Connection.db.collection("fs.files").find({
        "metadata.user_id": req.user._id,
        "metadata.folder_id": returnObjectID(req.params.folder),
        "metadata.isTrashed": false,
        isFavorited: false,
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

exports.favoriteFilesAndFolders = async (req, res, next) => {
  const files = await this.favoriteFiles(req, res, next);
  const folders = await favoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully favorited" },
  });
};

exports.unfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": false,
      isFavorited: false,
    });

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { isFavorited: false } }
  );
  if (unfavoritedFiles.result.nModified > 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": false,
      isFavorited: false,
    });
};

exports.unfavoriteFilesAndFolders = async (req, res, next) => {
  const files = await this.unfavoriteFiles(req, res, next);
  const folders = await unfavoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.moveFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFileArray(req);

  try {
    const movedFiles = await Connection.db.collection("fs.files").update(
      {
        _id: { $in: files },
      },
      {
        $set: {
          folder_id: returnObjectID(req.body.folder),
        },
      }
    );
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
