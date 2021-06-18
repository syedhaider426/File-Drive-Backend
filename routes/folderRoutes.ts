import { checkAuthenticated } from "../middlewares/requireLogin";
import { create_Folder, renameFolder } from "../controllers/folderController";
import { asyncHandler } from "../services/asyncHandler";
import { Application } from "express";
/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app: Application) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/api/folders", checkAuthenticated, asyncHandler(create_Folder));

  // @route POST - Creates a folder in a specific folder if the user is authenticated.
  app.post(
    "/api/folders/:folder",
    checkAuthenticated,
    asyncHandler(create_Folder)
  );

  // @route PATCH - Renames a folder if the user is authenticated.
  app.patch(
    "/api/folders/name",
    checkAuthenticated,
    asyncHandler(renameFolder)
  );
};
