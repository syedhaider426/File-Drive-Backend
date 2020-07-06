const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  uploadFile,
  moveFiles,
  deleteFiles,
  renameFile,
  copyFiles,
  trashFiles,
  restoreFiles,
  favoriteFiles,
  unfavoriteFiles,
  getFiles,
  getFilesAndFolders,
  getFavoriteFilesAndFolders,
  getTrashFilesAndFolders,
} = require("../controllers/fileController");

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

  // @route POST - Deletes a file or files if the user is authenticated.
  app.post("/api/files/delete", checkAuthenticated, deleteFiles);

  // @route POST - Renames a file if the user is authenticated.
  app.post("/api/files/rename", checkAuthenticated, renameFile);

  // @route POST - Copies a file if the user is authenticated.
  app.post("/api/files/copy", checkAuthenticated, copyFiles);

  // @route POST - Sends file to trash if the user is authenticated.
  app.post("/api/files/trash", checkAuthenticated, trashFiles);

  // @route POST - Restores a file if the user is authenticated.
  app.post("/api/files/restore", checkAuthenticated, restoreFiles);

  // @route POST - Favorites a folder if the user is authenticated.
  app.post("/api/files/favorite", checkAuthenticated, favoriteFiles);

  // @route POST - Unfavorites a folder if the user is authenticated.
  app.post("/api/files/unfavorite", checkAuthenticated, unfavoriteFiles);

  // @route GET - Gets files and folders for users
  app.get("/api/files/getAll", getFilesAndFolders);

  // @route GET - Gets favorited files and folders for users
  app.get("/api/files/getFavorite", getFavoriteFilesAndFolders);

  // @route GET - Gets trashed files and folders for users
  app.get("/api/files/getTrash", getTrashFilesAndFolders);
};
