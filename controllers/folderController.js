const Connection = require("../database/Connection");
const Joi = require("@hapi/joi");
const returnObjectID = require("../database/returnObjectID");

generateFolderArray = (req) => {
  const folders = [];

  /* If only one folder is selected, the type of the folderID is a string; otherwise
   * if two or more folders are selected, it will be an array
   */
  if (typeof req.body.folderID === "string")
    folders.push(returnObjectID(req.body.folderID));
  else
    req.body.folderID.forEach((folder) => {
      folders.push(returnObjectID(folder));
    });
  return folders;
};

exports.getFolders = async (req, res) => {
  return await Connection.db
    .collection("folders")
    .find({ user_id: req.user._id, isTrashed: false })
    .toArray();
};

exports.getTrashFolders = async (req, res) => {
  try {
    return await Connection.db
      .collection("folders")
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
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.getFavoriteFolders = async (req, res) => {
  try {
    return await Connection.db
      .collection("folders")
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
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.createFolder = async (req, res) => {
  // Create JOI Schema
  const schema = Joi.object({
    folder: Joi.string().required().messages({
      "string.empty": `Folder cannot be empty.`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate({
    folder: req.body.folder,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  const folder = {
    foldername: req.body.folder,
    user_id: req.user._id,
    parent_id: "",
    description: "",
    createdOn: new Date(),
    isTrashed: false,
  };
  try {
    // Creates folder
    const createdFolder = await Connection.db
      .collection("folders")
      .insertOne(folder);

    // If folder was created succesfully, return a success response back to client
    if (createdFolder.insertedId)
      return res.json({
        success: {
          message: "Folder successfully created",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error creating this folder. Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.renameFolder = async (req, res) => {
  // Create JOI Schema
  const schema = Joi.object({
    folder: Joi.string().required().messages({
      "string.empty": `Folder cannot be empty.`,
    }),
  });

  // Validate user inputs
  const validation = await schema.validate({
    folder: req.body.folder,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    // Updates the folder with the new folder name
    const renamedFolderResult = await Connection.db
      .collection("folders")
      .updateOne(
        {
          _id: returnObjectID(req.body.folderID),
        },
        {
          $set: { foldername: req.body.folder },
        }
      );

    // If the folder was renamed succesfully, send a success response back to the client
    if (renamedFolderResult.result.nModified === 1)
      return res.json({
        sucess: {
          message: "Folder was renamed successfully.",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error renaming this folder. Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.moveFolders = async (req, res) => {
  // Folders represent an array of folders that have been selected to be moved to a new location
  const folders = generateFolderArray(req);
  try {
    // Change location of folder(s)
    const movedFolderResult = await Connection.db
      .collection("folders")
      .updateOne(
        {
          _id: { $in: folders },
        },
        {
          $set: { parent_id: returnObjectID(req.body.moveFolder) },
        }
      );
    // If the folders were moved successfully, return a success response back to the client
    if (movedFolderResult.result.nModified > 0)
      return res.json({
        sucess: {
          message: "Folders were moved successfully.",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error moving the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.deleteFolders = async (req, res) => {
  // Folders represent an array of folders that will be permanently deleted
  const folders = generateFolderArray(req);

  try {
    // Find the files that are in the specified folder
    const files = await Connection.db
      .collection("fs.files")
      .find(
        {
          folder_id: { $in: folders },
        },
        {
          _id: 1,
        }
      )
      .toArray();

    // Deletes the files that are in fs.files and fs.chunks
    files.map(async (file) => {
      await Connection.gfs.delete(file._id);
    });

    // Delete all the selected folders
    const deletedFoldersResult = await Connection.db
      .collection("folders")
      .deleteMany({
        _id: { $in: folders },
      });
    // If the folders were moved successfully, return a success response back to the client
    if (deletedFoldersResult)
      return res.json({
        sucess: {
          message: "Folders were deleted successfully.",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error deleting the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.trashFolders = async (req, res) => {
  // Folders represent an array of folders that will be moved temporarily to the trash
  const folders = generateFolderArray(req);

  try {
    /*
     * Trash the folders and files
     * **NOTE**: trashedAt is a new field that gets added to each document. It has an index on it that
     * will expire after 30 days, therefore, deleting the folder and file
     */
    const trashedFoldersResult = await Connection.db
      .collection("folders")
      .updateMany(
        {
          _id: { $in: folders },
        },
        { $set: { isTrashed: true, trashedAt: new Date() } }
      );

    if (trashedFoldersResult.result.nModified > 0) {
      // Restore the files
      const trashedFilesResult = await Connection.db
        .collection("fs.files")
        .updateMany(
          {
            folder_id: { $in: folders },
            user_id: req.user._id,
          },
          { $set: { isTrashed: true, trashedAt: new Date() } }
        );

      // If the files were successfully trashed, return a success response back to the client
      if (trashedFilesResult.result.nModified > 0)
        return res.json({
          sucess: {
            message: "Folders were trashed successfully.",
          },
        });
    }
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error trashing the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.restoreFolders = async (req, res) => {
  // Folders represent an array of folders that will be restored from the trash
  const folders = generateFolderArray(req);
  try {
    /*
     * Restore the folders
     * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
     */
    const restoredFolders = await Connection.db
      .collection("folders")
      .updateMany(
        { user_id: req.user._id, _id: { $in: folders } },
        { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
      );
    if (restoredFolders.result.nModified > 0) {
      // Restore the files
      const restoredFiles = await Connection.db
        .collection("fs.files")
        .updateMany(
          {
            user_id: req.user._id,
            folder_id: { $in: folders },
          },
          { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
        );
      // If files are restored succesfully, return a sucess response back to the client
      if (restoredFiles.result.nModified > 0) {
        return res.json({
          sucess: {
            message: "Folders were restored successfully.",
          },
        });
      }
    }
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error restoring the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.favoriteFolders = async (req, res) => {
  // Folders represent an array of folders that will be favorited
  const folders = generateFolderArray(req);
  try {
    // Favorites the selected folders
    const favoritedFolders = await Connection.db
      .collection("folders")
      .updateMany({ _id: { $in: folders } }, { $set: { isFavorited: true } });
    // If folders were succesfully favorited, return a success response back to the client
    if (favoritedFolders.result.nModified > 0)
      return res.json({
        success: {
          message: "Folders were successfully favorited",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error favoriting the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};

exports.unfavoriteFolders = async (req, res) => {
  // Folders represent an array of folders that will be unfavorited
  const folders = generateFolderArray(req);
  try {
    // Unfavorites the selected folder
    const unfavoritedFolders = await Connection.db
      .collection("folders")
      .updateMany({ _id: { $in: folders } }, { $set: { isFavorited: false } });

    // If the folders were unfavorited, return a success response back to the client
    if (unfavoritedFolders.result.nModified > 0)
      return res.status(404).json({
        success: {
          message: "Folders were successfully unfavorited",
        },
      });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error unfavoriting the folder(s). Please try again.",
        },
      });
    else return res.status(404).json(err);
  }
};
