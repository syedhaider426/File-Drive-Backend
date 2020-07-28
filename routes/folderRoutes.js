const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
} = require("../controllers/folderController");

/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/api/folders", checkAuthenticated, createFolder);

  // @route POST - Creates a folder in a specific folder if the user is authenticated.
  app.post("/api/folders/:folder", checkAuthenticated, createFolder);

  // @route PUT - Renames a folder if the user is authenticated.
  app.put("/api/folders/name", checkAuthenticated, renameFolder);
};
