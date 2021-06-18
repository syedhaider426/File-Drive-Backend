import { checkAuthenticated } from "../middlewares/requireLogin";
import {
  uploadFile,
  renameFile,
  copyFiles,
  undoCopy,
  viewFile,
} from "../controllers/fileController";
import { Application } from "express";
import { asyncHandler } from "../services/asyncHandler";

/**
 * This module focuses on the endpoints related to uploading, moving, deleting, and renaming files.
 * @param {*} app
 */
module.exports = (app: Application) => {
  // @route GET - Gets a specific file and returns the contents of the file to the user
  app.get("/api/files/:file", checkAuthenticated, viewFile);

  // @route POST - Uploads a file or files if the user is authenticated.
  app.post("/api/files/upload", checkAuthenticated, uploadFile);

  // @route POST - Uploads a file or files to a specified folder and the user is authenticated.
  app.post("/api/files/upload/:folder", checkAuthenticated, uploadFile);

  // @route POST - Copies a file if the user is authenticated.
  app.post("/api/files/copy", checkAuthenticated, copyFiles);

  // @route POST - Copies a file if the user is authenticated.
  app.post("/api/files/copy/:folder", checkAuthenticated, copyFiles);

  // @route PATCH - Renames a file if the user is authenticated.
  app.patch("/api/files/name", checkAuthenticated, asyncHandler(renameFile));

  // @route DELETE - Deletes the copied files if the user is authenticated.
  app.delete("/api/files/copy", checkAuthenticated, undoCopy);

  // @route DELETE - Deletes the copied files in a specific folder if the user is authenticated.
  app.delete("/api/files/copy/:folder", checkAuthenticated, undoCopy);
};
