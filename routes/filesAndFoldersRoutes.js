const { checkAuthenticated } = require("../middlewares/requireLogin");

const {
  unfavoriteFilesAndFolders,
  getFilesAndFolders,
  getFavoriteFilesAndFolders,
  getTrashFilesAndFolders,
  trashFilesAndFolders,
  deleteFilesAndFolders,
  restoreFilesAndFolders,
  favoriteFilesAndFolders,
  undoTrashFilesAndFolders,
  undoFavoriteFilesAndFolders,
  homeUnfavoriteFilesAndFolders,
  deleteAll,
  restoreAll,
  moveFilesAndFolders,
} = require("../controllers/fileFolderController");

/**
 * This module focuses on the endpoints related to uploading, moving, deleting, and renaming files.
 * @param {*} app
 */
module.exports = (app) => {
  // @route GET - Gets files and folders for in the 'Home'/'My Drive' directory for specific user
  app.get("/api/drive/home", checkAuthenticated, getFilesAndFolders);

  // @route GET - Gets favorited files and folders for specific user
  app.get(
    "/api/users/favorites",
    checkAuthenticated,
    getFavoriteFilesAndFolders
  );

  // @route GET - Gets trashed files and folders for users
  app.get("/api/users/trash", checkAuthenticated, getTrashFilesAndFolders);

  // @route GET - Gets files and folders in a specific folder for specific user
  app.get("/api/users/files/:folder", checkAuthenticated, getFilesAndFolders);

  // @route PATCH - Moves a files/folders to designated folder if the user is authenticated.
  app.patch(
    "/api/files/moveTo-folder",
    checkAuthenticated,
    moveFilesAndFolders
  );

  // @route PATCH - Sends files/folders to trash if the user is authenticated.
  app.patch("/api/files/trash", checkAuthenticated, trashFilesAndFolders);

  // @route PATCH - Sends files/folders in a specific folder to trash if the user is authenticated.
  app.patch(
    "/api/files/trash/:folder",
    checkAuthenticated,
    trashFilesAndFolders
  );

  // @route PATCH - Restores a files/folders if the user accidentally trashes it.
  app.patch(
    "/api/files/trash/undo-trash",
    checkAuthenticated,
    undoTrashFilesAndFolders
  );

  // @route PATCH - Restores a file or folder in a specific folder if the user accidentally trashes it.
  app.patch(
    "/api/files/trash/undo-trash/:folder",
    checkAuthenticated,
    undoTrashFilesAndFolders
  );

  // @route DELETE - Deletes the selected files and folders for specific user
  app.delete("/api/files/selected", checkAuthenticated, deleteFilesAndFolders);

  // @route DELETE - Deletes all files/folders for specific user
  app.delete("/api/files/all", checkAuthenticated, deleteAll);

  // @route PATCH - Restores selected files/folders for specific user
  app.patch(
    "/api/files/selected/restore",
    checkAuthenticated,
    restoreFilesAndFolders
  );

  // @route PATCH - Restore all files and folders for specific user
  app.patch("/api/files/all/restore", checkAuthenticated, restoreAll);

  // @route PATCH - Favorites a folder for specific user
  app.patch(
    "/api/files/favorites",
    checkAuthenticated,
    favoriteFilesAndFolders
  );

  // @route PATCH - Unfavorites a file/folder the user may have accidentally favorited (in Home menu) for specific user
  app.patch(
    "/api/files/undo-favorites",
    checkAuthenticated,
    undoFavoriteFilesAndFolders
  );

  // @route PATCH - Unfavorites a folder (in Favorites menu) for specific user
  app.patch(
    "/api/files/unfavorite",
    checkAuthenticated,
    unfavoriteFilesAndFolders
  );

  // @route PATCH - Unfavorites files/folders in the 'Home' page. This occurs when a user favorites a file/folder, and then clicks 'Undo' on the home page.
  app.patch(
    "/api/files/home-undo-favorite",
    checkAuthenticated,
    homeUnfavoriteFilesAndFolders
  );
};
