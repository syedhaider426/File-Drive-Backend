const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  uploadFile,
  moveFiles,
  deleteFiles,
  renameFile,
  copyFiles,
} = require("../controllers/fileController");
const checkFolderExists = require("../middlewares/checkFolderExists");

/**
 * This module focuses on the endpoints related to uploading, moving, deleting, and renaming files.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Uploads a file or files if the user is authenticated.
  app.post("/api/upload", checkAuthenticated, uploadFile);

  // @route POST - Uploads a file or files to a specified folder if the folder exists and the user is authenticated.
  app.post(
    "/api/upload/:folder",
    checkAuthenticated,
    checkFolderExists,
    uploadFile
  );

  // @route POST - Moves a file or files to designated folder if the user is authenticated.
  app.post("/moveFiles", checkAuthenticated, moveFiles);

  // @route POST - Deletes a file or files if the user is authenticated.
  app.post("/deleteFiles", checkAuthenticated, deleteFiles);

  // @route POST - Renames a file if the user is authenticated.
  app.post("/renameFile", checkAuthenticated, renameFile);

  // @route POST - Copies a file if the user is authenticated.
  app.post("/copyFile", checkAuthenticated, copyFiles);
};
