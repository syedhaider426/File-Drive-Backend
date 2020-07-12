const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
  moveFolders,
  deleteFolders,
  restoreFolders,
  favoriteFolders,
  unfavoriteFolders,
} = require("../controllers/folderController");

/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/api/folders/create", checkAuthenticated, createFolder);

  // @route POST - Renames a folder if the user is authenticated.
  app.post("/api/folders/rename", checkAuthenticated, renameFolder);

  // @route POST - Moves a folder if the user is authenticated.
  app.post("/api/folders/move", checkAuthenticated, moveFolders);
};
