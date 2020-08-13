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
  getFolderDetails,
  moveFolders,
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
  moveFiles,
} = require("./fileController");

exports.getFilesAndFolders = async (req, res, next) => {
  //Return the files for the specific user
  const files = await getFiles(req, res, next);
  const folders = await getFolders(req, res, next);
  let folderPath = [];
  //Used for tracking the hierarchy of folders in Home
  if (req.params.folder !== undefined)
    folderPath = await getFolderHierarchy(req, res, next);
  let moveTitleFolder = {};
  //Used for tracking the current/previous folder in the move item dialog
  if (req.query.move === "true") {
    let data = await getFolderDetails(req.params.folder);
    moveTitleFolder = {
      foldername: data[0].foldername,
      parent_id: data[0].parent_id,
    };
  }
  return res.json({
    files,
    folders,
    folderPath,
    moveTitleFolder,
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
  await trashFiles(req, res, next);
  await trashFolders(req, res, next);
  return res.json({
    success: {
      message: "Files/folders were succesfully trashed",
    },
  });
};

exports.deleteFilesAndFolders = async (req, res, next) => {
  await deleteFiles(req, res, next);
  await deleteFolders(req, res, next);
  return res.json({
    success: {
      message: "Files/folders were succesfully deleted",
    },
  });
};

exports.restoreFilesAndFolders = async (req, res, next) => {
  await restoreFiles(req, res, next);
  await restoreFolders(req, res, next);
  return res.json({
    files,
    folders,
    sucess: { message: "Files/folders were successfully restored" },
  });
};

exports.favoriteFilesAndFolders = async (req, res, next) => {
  await favoriteFiles(req, res, next);
  await favoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully favorited" },
  });
};

exports.unfavoriteFilesAndFolders = async (req, res, next) => {
  await unfavoriteFiles(req, res, next);
  await unfavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.undoTrashFilesAndFolders = async (req, res, next) => {
  await undoTrashFiles(req, res, next);
  await undoTrashFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully restored" },
  });
};
exports.undoFavoriteFilesAndFolders = async (req, res, next) => {
  await undoFavoriteFiles(req, res, next);
  await undoFavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.homeUnfavoriteFilesAndFolders = async (req, res, next) => {
  await homeUnfavoriteFiles(req, res, next);
  await homeUnfavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

exports.moveFilesAndFolders = async (req, res, next) => {
  await moveFiles(req, res, next);
  await moveFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully restored" },
  });
};

exports.deleteAll = async (req, res, next) => {
  const files = await getTrashFiles(req, res, next);
  const folders = await getTrashFolders(req, res, next);
  req.body.selectedFiles = files;
  await deleteFiles(req, res, next);
  req.body.selectedFolders = folders;
  await deleteFolders(req, res, next);
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
  await restoreFiles(req, res, next);
  req.body.selectedFolders = folders;
  await restoreFolders(req, res, next);
  res.json({
    success: {
      message: "Succesfully restored trash.",
    },
  });
};
