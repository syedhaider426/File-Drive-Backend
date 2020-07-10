const Connection = require("../database/Connection");
const formidable = require("formidable");
const fs = require("fs");
const returnObjectID = require("../database/returnObjectID");
const {
  trashFolders,
  deleteFolders,
  restoreFolders,
  favoriteFolders,
  unfavoriteFolders,
  getFolders,
  getTrashFolders,
  getFavoriteFolders,
} = require("./folderController");

const {
  getFiles,
  trashFiles,
  deleteFiles,
  restoreFiles,
  getTrashFiles,
  getFavoriteFiles,
  favoriteFiles,
} = require("./fileController");

exports.getFilesAndFolders = async (req, res, next) => {
  //Return the files for the specific user
  const files = await getFiles(req, res, next);
  const folders = await getFolders(req, res, next);
  return res.json({
    files,
    folders,
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
