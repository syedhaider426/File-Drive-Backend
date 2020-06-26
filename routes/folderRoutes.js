const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
  moveFolders,
  deleteFolders,
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
};
