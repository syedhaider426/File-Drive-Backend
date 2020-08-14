const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
} = require("../controllers/folderController");
const { asyncHandler } = require("../services/asyncHandler");

/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/api/folders", checkAuthenticated, asyncHandler(createFolder));

  // @route POST - Creates a folder in a specific folder if the user is authenticated.
  app.post(
    "/api/folders/:folder",
    checkAuthenticated,
    asyncHandler(createFolder)
  );

  // @route PATCH - Renames a folder if the user is authenticated.
  app.patch(
    "/api/folders/name",
    checkAuthenticated,
    asyncHandler(renameFolder)
  );
};
