const Connection = require("../database/Connection");

const {
  trashFolders,
  deleteFolders,
  restoreFolders,
  favoriteFolders,
  unfavoriteFolders,
  getFolders,
  getTrashFolders,
  getFavoriteFolders,
  undoTrashFolders,
  undoFavoriteFolders,
  homeUnfavoriteFolders,
  getFolderHierarchy,
} = require("./folderController");

const {
  getFiles,
  trashFiles,
  deleteFiles,
  restoreFiles,
  getTrashFiles,
  getFavoriteFiles,
  favoriteFiles,
  undoTrashFiles,
  undoFavoriteFiles,
  unfavoriteFiles,
  homeUnfavoriteFiles,
} = require("./fileController");
const { findFolders } = require("../database/crud");

exports.getFilesAndFolders = async (req, res, next) => {
  //Return the files for the specific user
  const files = await getFiles(req, res, next);
  const folders = await getFolders(req, res, next);
  let folderPath = [];
  if (req.params.folder !== undefined)
    folderPath = await getFolderHierarchy(req, res, next);
  return res.json({
    files,
    folders,
    folderPath,
    success: {
      message: "Files/folders were succesfully retrieved",
    },
  });
};

exports.getFavoriteFilesAndFolders = async (req, res, next) => {
  // Finds the files that the user favorited
  const files = await getFavoriteFiles(req, res, next);
  const folders = await getFavoriteFolders(req, res, next);

  return res.json({
    files,
    folders,
    success: {
      message: "Favorited Files/folders were succesfully retrieved",
    },
  });
};

exports.getTrashFilesAndFolders = async (req, res, next) => {
  // Return the files that are in the user's trash
  const files = await getTrashFiles(req, res, next);
  const folders = await getTrashFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Trashed Files/folders were succesfully retrieved",
    },
  });
};

exports.trashFilesAndFolders = async (req, res, next) => {
  const files = await trashFiles(req, res, next);
  const folders = await trashFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Files/folders were succesfully trashed",
    },
  });
};

exports.deleteFilesAndFolders = async (req, res, next) => {
  const files = await deleteFiles(req, res, next);
  const folders = await deleteFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Files/folders were succesfully deleted",
    },
  });
};

exports.restoreFilesAndFolders = async (req, res, next) => {
  const files = await restoreFiles(req, res, next);
  const folders = await restoreFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully restored" },
  });
};

exports.favoriteFilesAndFolders = async (req, res, next) => {
  const files = await favoriteFiles(req, res, next);
  const folders = await favoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully favorited" },
  });
};

exports.unfavoriteFilesAndFolders = async (req, res, next) => {
  const files = await unfavoriteFiles(req, res, next);
  const folders = await unfavoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.undoTrashFilesAndFolders = async (req, res, next) => {
  const files = await undoTrashFiles(req, res, next);
  const folders = await undoTrashFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully restored" },
  });
};
exports.undoFavoriteFilesAndFolders = async (req, res, next) => {
  const files = await undoFavoriteFiles(req, res, next);
  const folders = await undoFavoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.homeUnfavoriteFilesAndFolders = async (req, res, next) => {
  const files = await homeUnfavoriteFiles(req, res, next);
  const folders = await homeUnfavoriteFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.deleteAll = async (req, res, next) => {
  const files = await getTrashFiles(req, res, next);
  const folders = await getTrashFolders(req, res, next);
  req.body.selectedFiles = files;
  const filesResult = await deleteFiles(req, res, next);
  req.body.selectedFolders = folders;
  const foldersResult = await deleteFolders(req, res, next);
  if (filesResult.length == 0 && foldersResult.length === 0)
    res.json({
      success: {
        message: "Succesfully emptied trash.",
      },
    });
};

exports.restoreAll = async (req, res, next) => {
  const files = await getTrashFiles(req, res, next);
  const folders = await getTrashFolders(req, res, next);
  req.body.selectedFiles = files;
  const filesResult = await restoreFiles(req, res, next);
  req.body.selectedFolders = folders;
  const foldersResult = await restoreFolders(req, res, next);
  if (filesResult.length == 0 && foldersResult.length === 0)
    res.json({
      success: {
        message: "Succesfully restored trash.",
      },
    });
};
