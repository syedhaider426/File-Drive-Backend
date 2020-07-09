const Connection = require("../database/Connection");
const Joi = require("@hapi/joi");
const returnObjectID = require("../database/returnObjectID");
const {
  findFolders,
  updateFolders,
  createFolder,
  updateFiles,
  findFiles,
  deleteFolder,
} = require("../database/crud");

generateFolderArray = (req) => {
  const folders = [];
  if (req.body.selectedFolders.length > 0)
    req.body.selectedFolders.forEach((folder) => {
      folders.push(returnObjectID(folder.id));
    });

  return folders;
};

exports.createFolder = async (req, res, next) => {
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

  // Creates folder
  const createdFolder = await createFolder(folder);

  // If folder was created succesfully, return a success response back to client
  if (createdFolder.insertedId)
    return res.status(201).json({
      success: {
        message: "Folder successfully created",
      },
    });
};

exports.renameFolder = async (req, res, next) => {
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

  // Updates the folder with the new folder name
  const renamedFolderResult = await updateFolders(
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
};

exports.deleteFolders = async (req, res, next) => {
  // Folders represent an array of folders that will be permanently deleted
  const folders = generateFolderArray(req);
  if (folders.length === 0)
    return await findFolders({
      user_id: req.user._id,
      isTrashed: true,
    });

  // Find the files that are in the specified folder
  const files = await findFiles({
    "metadata.folder_id": { $in: folders },
  });

  // Deletes the files that are in fs.files and fs.chunks
  const deletedFilesPromise = files.map(async (file) => {
    await Connection.gfs.delete(file._id);
  });

  return Promise.all(deletedFilesPromise).then(async () => {
    // Delete all the selected folders
    const deletedFoldersResult = await deleteFolder({
      _id: { $in: folders },
    });
    // If the folders were moved successfully, return a success response back to the client
    if (deletedFoldersResult.deletedCount > 0)
      return await findFolders({
        user_id: req.user._id,
        isTrashed: true,
      });
  });
};

exports.trashFolders = async (req, res, next) => {
  const folders = generateFolderArray(req);
  if (folders.length === 0)
    return await findFolders({
      user_id: req.user._id,
      parent_id: returnObjectID(req.body.folder),
      isTrashed: false,
    });

  let trashedFolders = await updateFolders(
    {
      _id: { $in: folders },
    },
    {
      $set: { isTrashed: true, trashedAt: new Date(), isFavorited: false },
    }
  );
  if (trashedFolders.result.nModified > 0)
    //Return the folders for the specific user
    return await findFolders({
      user_id: req.user._id,
      parent_id: returnObjectID(req.body.folder),
      isTrashed: false,
    });
};

exports.restoreFolders = async (req, res, next) => {
  // Folders represent an array of folders that will be restored from the trash
  const folders = generateFolderArray(req);
  if (folders.length === 0)
    return findFolders({
      user_id: req.user._id,
      isTrashed: true,
    });

  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */

  const restoredFolders = await updateFolders(
    { user_id: req.user._id, _id: { $in: folders } },
    { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
  );
  if (restoredFolders.result.nModified > 0) {
    // Restore the files
    const restoredFiles = await updateFiles(
      {
        "metadata.user_id": req.user._id,
        "metadata.folder_id": { $in: folders },
      },
      { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
    );

    // If files are restored succesfully, return a sucess response back to the client
    if (restoredFiles.result.nModified >= 0) {
      return await findFolders({
        user_id: req.user._id,
        isTrashed: true,
      });
    }
  }
};

exports.favoriteFolders = async (req, res, next) => {
  // Folders represent an array of folders that will be favorited
  const folders = generateFolderArray(req);
  if (folders.length === 0)
    return await findFolders({ user_id: req.user._id, isTrashed: false });
  // Favorites the selected folders
  const favoritedFolders = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: true } }
  );
  // If folders were succesfully favorited, return a success response back to the client
  if (favoritedFolders.result.nModified > 0)
    return await findFolders({
      user_id: req.user._id,
      isTrashed: false,
      isFavorited: false,
    });
};

exports.unfavoriteFolders = async (req, res, next) => {
  // Folders represent an array of folders that will be unfavorited
  const folders = generateFolderArray(req);
  if (folders.length === 0)
    return await findFolders({
      user_id: req.user._id,
      isTrashed: false,
      isFavorited: true,
    });

  // Unfavorites the selected folder
  const unfavoritedFolders = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: false } }
  );

  // If the folders were unfavorited, return a success response back to the client
  if (unfavoritedFolders.result.nModified > 0)
    return await findFolders({
      user_id: req.user._id,
      isTrashed: false,
      isFavorited: true,
    });
};

exports.moveFolders = async (req, res, next) => {
  // Folders represent an array of folders that have been selected to be moved to a new location
  const folders = generateFolderArray(req);
  try {
    // Change location of folder(s)
    const movedFolderResult = await updateFolders(
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
    else next(err);
  }
};
