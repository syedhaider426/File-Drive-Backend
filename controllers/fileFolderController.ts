import { Request, Response, NextFunction } from "express";

import {
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
  getAllFolders,
} from "./folderController";

import {
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
  getAllFiles,
} from "./fileController";

export const getFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Return the files for the specific user
  const files = await getFiles(req);
  const folders = await getFolders(req);
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

export const getAllFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Finds the files that the user favorited
  const files = await getAllFiles(req, res, next);
  const folders = await getAllFolders(req, res, next);
  return res.json({
    files,
    folders,
    success: {
      message: "Favorited Files/folders were succesfully retrieved",
    },
  });
};

export const getFavoriteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const getTrashFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const trashFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await trashFiles(req);
  await trashFolders(req);
  return res.json({
    success: {
      message: "Files/folders were succesfully trashed",
    },
  });
};

export const deleteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await deleteFiles(req, res, next);
  await deleteFolders(req, res, next);
  return res.json({
    success: {
      message: "Files/folders were succesfully deleted",
    },
  });
};

export const restoreFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await restoreFiles(req, res, next);
  await restoreFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully restored" },
  });
};

export const favoriteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await favoriteFiles(req, res, next);
  await favoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully favorited" },
  });
};

export const unfavoriteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await unfavoriteFiles(req, res, next);
  await unfavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

export const undoTrashFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await undoTrashFiles(req, res, next);
  await undoTrashFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully restored" },
  });
};
export const undoFavoriteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await undoFavoriteFiles(req, res, next);
  await undoFavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

export const homeUnfavoriteFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await homeUnfavoriteFiles(req, res, next);
  await homeUnfavoriteFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully unfavorited" },
  });
};

export const moveFilesAndFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await moveFiles(req, res, next);
  await moveFolders(req, res, next);
  return res.json({
    sucess: { message: "Files/folders were successfully restored" },
  });
};

export const deleteAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const restoreAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
