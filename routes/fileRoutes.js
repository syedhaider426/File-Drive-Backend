const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  uploadFile,
  moveFiles,
  renameFile,
  copyFiles,
  favoriteFiles,
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
  app.post("/api/files/trash", checkAuthenticated, trashFilesAndFolders);

  // @route POST - Restores a file if the user is authenticated.
  app.post("/api/files/restore", checkAuthenticated, restoreFilesAndFolders);

  // @route POST - Favorites a folder if the user is authenticated.
  app.post("/api/files/favorite", checkAuthenticated, favoriteFilesAndFolders);

  // @route POST - Unfavorites a folder if the user is authenticated.
  app.post(
    "/api/files/unfavorite",
    checkAuthenticated,
    unfavoriteFilesAndFolders
  );

  // @route GET - Gets files and folders for users
  app.get("/api/files/home", getFilesAndFolders);

  // @route GET - Gets favorited files and folders for users
  app.get("/api/files/favorites", getFavoriteFilesAndFolders);

  // @route GET - Gets trashed files and folders for users
  app.get("/api/files/trash", getTrashFilesAndFolders);
};
