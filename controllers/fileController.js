const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");
const Joi = require("@hapi/joi");
const { findFiles, updateFiles, updateFolders } = require("../database/crud");
const { getFolders } = require("./folderController");

generateFileArray = (req) => {
  const files = [];
  if (req.body.selectedFiles !== undefined)
    req.body.selectedFiles.forEach((file) => {
      let id;
      if (file.id) id = file.id;
      else id = file._id; //only used when deleting all files
      files.push(returnObjectID(id));
    });
  return files;
};

exports.uploadFile = (req, res, next) => {
  const options = {
    metadata: {
      user_id: req.user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.params.folder),
      isFavorited: false,
    },
  };
  //Pass in an array of files
  const form = new formidable.IncomingForm(req, res, next);
  form.multiples = true;

  //This is necessary to trigger the events
  form.parse(req, async (err, fields, fileList) => {
    if (fileList.files.length === undefined) {
      const writestream = Connection.gfs.openUploadStream(
        fileList.files.name,
        options
      );
      const id = writestream.id;
      fs.createReadStream(fileList.files.path)
        .pipe(writestream)
        .on("finish", async () => {
          const uploadedFiles = await findFiles({
            _id: id,
            "metadata.user_id": req.user._id,
            "metadata.folder_id": returnObjectID(req.params.folder),
            "metadata.isTrashed": false,
          });
          const allFiles = await findFiles({
            "metadata.user_id": req.user._id,
            "metadata.folder_id": returnObjectID(req.params.folder),
            "metadata.isTrashed": false,
          });
          return res.json({
            success: {
              message: "File uploaded succesfully",
            },
            files: allFiles,
            uploadedFiles,
          });
        });
    } else {
      let promises = [];
      for (let i = 0; i < fileList.files.length; ++i) {
        let promise = new Promise((resolve, reject) => {
          const writeStream = Connection.gfs.openUploadStream(
            fileList.files[i].name,
            options
          );
          const id = writeStream.id;
          fs.createReadStream(fileList.files[i].path)
            .pipe(writeStream)
            .on("error", (err) => {
              throw reject(err);
            })
            .on("finish", () => {
              resolve(id);
            });
        });
        promises.push(promise);
      }
      const resultArray = [];
      for (const promiseFile of promises) {
        resultArray.push(await promiseFile);
      }
      if (resultArray.length === fileList.files.length) {
        const uploadedFiles = await findFiles({
          _id: { $in: resultArray },
          "metadata.user_id": req.user._id,
          "metadata.folder_id": returnObjectID(req.params.folder),
          "metadata.isTrashed": false,
        });
        const allFiles = await findFiles({
          "metadata.user_id": req.user._id,
          "metadata.folder_id": returnObjectID(req.params.folder),
          "metadata.isTrashed": false,
        });
        return res.json({
          success: {
            message: "Files were uploaded succesfully",
          },
          files: allFiles,
          uploadedFiles,
        });
      } else {
        return res.status(400).json({
          error: {
            message:
              "Files could not be uploaded at this time. Please try again later",
          },
        });
      }
    }
  });

  // If an error occurs, return an error response back to the client
  form.on("error", (err) => {
    if (err) next(err);
  });
};

exports.copyFiles = async (req, res, next) => {
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
      isFavorited: false,
    },
  };
  const gfs = Connection.gfs;
  const promises = [];
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  for (let i = 0; i < files.length; ++i) {
    let promise = new Promise((resolve, reject) => {
      // Downloads the file from the GridFSBucket
      const downloadStream = gfs.openDownloadStream(
        returnObjectID(files[i].id)
      );
      // Uploads the file to GridFSBucket
      const writeStream = gfs.openUploadStream(
        `Copy of ${files[i].filename}`,
        options
      );
      const id = writeStream.id;
      console.log("File", files[i]);
      downloadStream
        .pipe(writeStream)
        .on("error", (err) => {
          throw reject(err);
        })
        .on("finish", () => {
          console.log("Copied first file");
          resolve(id);
        });
    });
    promises.push(promise);
  }
  const resultArray = [];
  for (const promiseFile of promises) {
    resultArray.push(await promiseFile);
  }
  if (resultArray.length === files.length) {
    const files = await findFiles({ _id: { $in: resultArray } });
    const newFiles = [{ id: resultArray }];
    return res.json({
      files,
      newFiles,
      success: {
        message: "Files were sucessfully copied",
      },
    });
  } else {
    return res.status(400).json({
      error: {
        message:
          "Files could not be copied at this time. Please try again later",
      },
    });
  }
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
    "metadata.isFavorited": true,
  });
};

exports.deleteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getTrashFiles(req, res, next);
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return await this.getTrashFiles(req, res, next);
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
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": req.body.trashMenu === undefined ? false : true,
      "metadata.isFavorited": { $in: req.body.isFavorited },
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
      },
    }
  );
  if (trashedFiles.result.nModified > 0)
    //Return the files for the specific user
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": req.body.trashMenu === undefined ? false : true,
      "metadata.isFavorited": { $in: req.body.isFavorited },
    });
};

exports.restoreFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return await this.getTrashFiles(req, res, next);
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0)
    return await this.getTrashFiles(req, res, next);
};

exports.undoTrashFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return await this.getFiles(req, res, next);
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0)
    return await this.getFiles(req, res, next);
};

exports.renameFile = async (req, res, next) => {
  // Create JOI Schema
  const schema = Joi.object({
    file: Joi.string().required().messages({
      "string.empty": `File cannot be empty.`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate({
    file: req.body.newName,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    // Finds file and renames it
    const renamedFile = await Connection.gfs.rename(
      returnObjectID(req.body.id),
      req.body.newName.trim()
    );
    if (renamedFile === undefined) {
      return res.json({
        success: {
          message: "File was sucessfully renamed",
        },
      });
    }
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error renaming the selected file. Please try again.",
        },
      });
    else next(err);
  }
};

exports.undoCopy = async (req, res, next) => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files = generateFileArray(req);
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      const files = await this.getFiles(req, res, next);
      res.json({ files });
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

exports.favoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be favorited
  const files = generateFileArray(req);
  if (files.length === 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": false,
      "metadata.isFavorited":
        req.body.favoritesMenu === undefined ? { $in: [false, true] } : true,
    });

  const favoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": true } }
  );
  if (favoritedFiles.result.nModified > 0)
    return await findFiles({
      "metadata.user_id": req.user._id,
      "metadata.folder_id": returnObjectID(req.params.folder),
      "metadata.isTrashed": false,
      "metadata.isFavorited":
        req.body.favoritesMenu === undefined ? { $in: [false, true] } : true,
    });
};

exports.unfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getFavoriteFiles(req, res, next);

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0)
    return await this.getFavoriteFiles(req, res, next);
};

exports.undoFavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getFiles(req, res, next);

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) {
    return await this.getFiles(req, res, next);
  }
};

exports.moveFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFileArray(req);
  if (files.length > 0) {
    await updateFiles(
      {
        _id: { $in: files },
      },
      {
        $set: {
          "metadata.folder_id": returnObjectID(req.body.moveFolder),
        },
      }
    );
    return await this.getFiles(req, res, next);
  } else return await this.getFiles(req, res, next);
};

exports.homeUnfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return await this.getFiles(req, res, next);

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0)
    return await this.getFiles(req, res, next);
};
