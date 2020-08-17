const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");
const Joi = require("@hapi/joi");
const { findFiles, updateFiles } = require("../services/files");

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

exports.viewFile = async (req, res, next) => {
  // id of file
  const file = await findFiles({ _id: returnObjectID(req.params.file) });
  res.setHeader("Content-Type", file[0].contentType);
  Connection.gfs.openDownloadStream(returnObjectID(file[0]._id)).pipe(res);
};

exports.uploadFile = async (req, res, next) => {
  const options = {
    metadata: {
      user_id: req.user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.params.folder),
      isFavorited: false,
    },
  };

  //Pass in an array of files
  const form = formidable.IncomingForm();
  form.multiples = true;
  form.maxFileSize = 3000 * 1024 * 1024; //3gb
  //This is necessary to trigger the events
  form.parse(req, async (err, fields, fileList) => {
    if (fileList.files.length === undefined) {
      options.contentType = fileList.files.type;
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
          const allFiles = await this.getFiles(req);
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
          options.contentType = fileList.files[i].type;
          const writeStream = Connection.gfs.openUploadStream(
            fileList.files[i].name,
            options
          );
          const id = writeStream.id;
          fs.createReadStream(fileList.files[i].path)
            .pipe(writeStream)
            .on("error", (err) => {
              reject(err);
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
        const allFiles = await this.getFiles(req);
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

  // // If an error occurs, return an error response back to the client
  // form.on("error", (err) => {
  //   if (err) next(err);
  // });
};

exports.copyFiles = async (req, res, next) => {
  const files = [];
  const filesSelectedLength = req.body.selectedFiles.length;
  // Pushes the files id and name into the 'files' array
  for (let i = 0; i < filesSelectedLength; ++i) {
    files.push({
      _id: returnObjectID(req.body.selectedFiles[i]._id),
      filename: req.body.selectedFiles[i].filename,
    });
  }
  const gfs = Connection.gfs;
  const promises = [];
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  for (let i = 0; i < files.length; ++i) {
    let promise = new Promise((resolve, reject) => {
      const options = {
        metadata: {
          user_id: req.user._id,
          isTrashed: false,
          folder_id: returnObjectID(req.params.folder),
          isFavorited: false,
        },
        contentType: req.body.selectedFiles[i].contentType,
      };
      // Downloads the file from the GridFSBucket
      const downloadStream = gfs.openDownloadStream(
        returnObjectID(files[i]._id)
      );
      // Uploads the file to GridFSBucket
      const writeStream = gfs.openUploadStream(
        `Copy of ${files[i].filename}`,
        options
      );
      const id = writeStream.id;
      downloadStream
        .pipe(writeStream)
        .on("error", (err) => {
          reject(err);
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
  if (resultArray.length === files.length) {
    const files = await findFiles({ _id: { $in: resultArray } });
    const newFiles = { id: resultArray };
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

exports.getAllFiles = async (req, res, next) => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": req.user._id,
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
  if (files.length === 0) return;
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return;
    })
    .catch((err) => {
      // If there is an error with Mongo, an error
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

exports.trashFiles = async (req) => {
  const files = generateFileArray(req);
  if (files.length === 0) return;
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
  if (trashedFiles.result.nModified > 0) return;
};

exports.restoreFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return;
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0) return;
};

exports.undoTrashFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return;
  const restoredFiles = await updateFiles(
    {
      "metadata.user_id": req.user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0) return;
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
    // If there is an error with Mongo, an error
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
  const files = req.body.selectedFiles;
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(returnObjectID(file));
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return;
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
  if (files.length === 0) return;
  const favoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": true } }
  );
  if (favoritedFiles.result.nModified > 0) return;
};

exports.unfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) return;
};

exports.undoFavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) {
    return;
  }
};

exports.moveFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files = generateFileArray(req);
  if (files.length > 0) {
    const movedFiles = await updateFiles(
      {
        _id: { $in: files },
      },
      {
        $set: {
          "metadata.folder_id": returnObjectID(req.body.moveFolder),
        },
      }
    );
    if (movedFiles.result.nModified > 0) return;
  }
};

exports.homeUnfavoriteFiles = async (req, res, next) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) return;
};
