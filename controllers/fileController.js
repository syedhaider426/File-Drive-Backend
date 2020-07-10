const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");

const { findFiles, updateFiles } = require("../database/crud");

generateFileArray = (req) => {
  const files = [];
  const selectedFiles = req.body.selectedFiles || req.body.tempFiles;
  if (selectedFiles !== undefined)
    selectedFiles.forEach((file) => {
      files.push(returnObjectID(file.id));
    });
  return files;
};

exports.uploadFile = (req, res, next) => {
  const options = {
    metadata: {
      user_id: req.user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.params.folder),
    },
  };
  //Pass in an array of files
  const form = new formidable.IncomingForm();

  //This is necessary to trigger the events
  form.parse(req);

  // File has been received
  form.on("file", (field, file) => {
    const writestream = Connection.gfs.openUploadStream(file.name, options);
    fs.createReadStream(file.path)
      .pipe(writestream)
      .once("finish", () => {
        console.log("Finished");
      });
  });

  // If an error occurs, return an error response back to the client
  form.on("error", (err) => {
    if (err) next(err);
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

exports.getFiles = async (req, res, next) => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": req.user._id,
    "metadata.folder_id": returnObjectID(req.params.folder),
    "metadata.isTrashed": false,
  });
};

exports.getTrashFiles = async (req, res, next) => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": req.user._id,
    "metadata.isTrashed": true,
  });
};

exports.getFavoriteFiles = async (req, res, next) => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": req.user._id,
    "metadata.isTrashed": false,
    isFavorited: true,
  });
};

exports.deleteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getTrashFiles();
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return await this.getTrashFiles();
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

exports.trashFiles = async (req, res, next) => {
  const files = generateFileArray(req);
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.body.folder),
      "metadata.isTrashed": false,
      isFavorited:
        req.body.isFavorited !== undefined ? true : { $in: [false, true] },
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
      isFavorited:
        req.body.isFavorited !== undefined ? true : { $in: [false, true] },
    });
};

exports.restoreFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return await this.getTrashFiles();
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0) return await this.getTrashFiles();
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
      const newFiles = [{ id }];
      return res.json({
        files,
        newFiles,
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
  if (files.length === 0) return await this.getFiles();

  const favoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { isFavorited: true } }
  );
  if (favoritedFiles.result.nModified > 0) return await this.getFiles();
};

exports.unfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getFavoriteFiles();

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { isFavorited: false } }
  );
  if (unfavoritedFiles.result.nModified > 0)
    return await this.getFavoriteFiles();
};

exports.moveFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFileArray(req);

  try {
    const movedFiles = await updateFiles(
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
