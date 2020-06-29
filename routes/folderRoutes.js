const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
  moveFolders,
  deleteFolders,
  trashFolders,
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

  // @route POST - Deletes a folder if the user is authenticated.
  app.post("/api/folders/delete", checkAuthenticated, deleteFolders);

  // @route POST - Sends a folder to trash if the user is authenticated.
  app.post("/api/folders/trash", checkAuthenticated, trashFolders);

  // @route POST - Restores a folder for use if the user is authenticated.
  app.post("/api/folders/restore", checkAuthenticated, restoreFolders);

  // @route POST - Favorites a folder if the user is authenticated.
  app.post("/api/folders/favorite", checkAuthenticated, favoriteFolders);

  // @route POST - Unfavorites a folder if the user is authenticated.
  app.post("/api/folders/unfavorite", checkAuthenticated, unfavoriteFolders);
};
