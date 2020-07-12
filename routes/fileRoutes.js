const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  uploadFile,
  moveFiles,
  renameFile,
  copyFiles,
  undoCopy,
} = require("../controllers/fileController");

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
} = require("../controllers/fileFolderController");

/**
 * This module focuses on the endpoints related to uploading, moving, deleting, and renaming files.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Uploads a file or files if the user is authenticated.
  app.post("/api/files/upload", checkAuthenticated, uploadFile);

  // @route POST - Uploads a file or files to a specified folder if the folder exists and the user is authenticated.
  app.post("/api/files/upload/:folder", checkAuthenticated, uploadFile);

  // @route POST - Moves a file or files to designated folder if the user is authenticated.
  app.post("/api/files/move", checkAuthenticated, moveFiles);

  // @route DELETE - Deletes a file or files if the user is authenticated.
  app.post("/api/files/delete", checkAuthenticated, deleteFilesAndFolders);

  // @route POST - Renames a file if the user is authenticated.
  app.post("/api/files/rename", checkAuthenticated, renameFile);

  // @route POST - Copies a file if the user is authenticated.
  app.post("/api/files/copy", checkAuthenticated, copyFiles);

  // @route POST - Deletes the copied files if the user is authenticated.
  app.post("/api/files/undoCopy", checkAuthenticated, undoCopy);

  // @route POST - Sends file to trash if the user is authenticated.
  app.post(
    "/api/files/trash/:folder",
    checkAuthenticated,
    trashFilesAndFolders
  );

  // @route POST - Restores a file if the user is authenticated.
  app.post("/api/files/restore", checkAuthenticated, restoreFilesAndFolders);

  // @route POST - Restores a file or folder if the user accidentally trashes it.
  app.post(
    "/api/files/undoTrash/:folder",
    checkAuthenticated,
    undoTrashFilesAndFolders
  );

  // @route POST - Favorites a folder if the user is authenticated.
  app.post("/api/files/favorite", checkAuthenticated, favoriteFilesAndFolders);

  // @route POST - Favorites a folder if the user is authenticated.
  app.post(
    "/api/files/undoFavorite",
    checkAuthenticated,
    undoFavoriteFilesAndFolders
  );

  // @route POST - Unfavorites a folder if the user is authenticated.
  app.post(
    "/api/files/unfavorite",
    checkAuthenticated,
    unfavoriteFilesAndFolders
  );

  // @route POST - Unfavorites a folder if the user is authenticated.
  app.post(
    "/api/files/homeUnfavorite",
    checkAuthenticated,
    homeUnfavoriteFilesAndFolders
  );

  // @route GET - Gets files and folders for users
  app.get("/api/drive/home", checkAuthenticated, getFilesAndFolders);

  // @route GET - Gets files and folders for users
  app.get("/api/drive/folders/:folder", checkAuthenticated, getFilesAndFolders);

  // @route GET - Gets favorited files and folders for users
  app.get(
    "/api/drive/favorites",
    checkAuthenticated,
    getFavoriteFilesAndFolders
  );

  // @route GET - Gets trashed files and folders for users
  app.get("/api/drive/trash", checkAuthenticated, getTrashFilesAndFolders);

  // @route post - Deletes all files and folders for user
  app.post("/api/files/deleteAll", checkAuthenticated, deleteAll);

  // @route post - Restore all files and folders for user
  app.post("/api/files/restoreAll", checkAuthenticated, restoreAll);
};
