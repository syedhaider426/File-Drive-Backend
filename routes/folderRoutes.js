const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
  moveFolders,
  deleteFolders,
  trashFolders,
  restoreFolders,
} = require("../controllers/folderController");

/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/createFolder", checkAuthenticated, createFolder);

  // @route POST - Renames a folder if the user is authenticated.
  app.post("/renameFolder", checkAuthenticated, renameFolder);

  // @route POST - Moves a folder if the user is authenticated.
  app.post("/moveFolder", checkAuthenticated, moveFolders);

  // @route POST - Deletes a folder if the user is authenticated.
  app.post("/deleteFolder", checkAuthenticated, deleteFolders);

  // @route POST - Sends a folder to trash if the user is authenticated.
  app.post("/trashFolder", checkAuthenticated, trashFolders);

  // @route POST - Restores a folder for use if the user is authenticated.
  app.post("/restoreFolder", checkAuthenticated, restoreFolders);
};
