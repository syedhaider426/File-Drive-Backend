const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
  moveFolder,
} = require("../controllers/folderController");

/**
 * This module focuses on the endpoints related to creating, renaming, and moving folders.
 * @param {*} app
 */
module.exports = (app) => {
  // @route POST - Creates a folder if the user is authenticated.
  app.post("/createFolder", checkAuthenticated, createFolder);

  // @route POST - Renames a folder if the user is authenticated.
  app.post("/renameFolder", checkAuthenticated, renameFolder);

  // @route POST - Deletes a folder if the user is authenticated.
  app.post("/moveFolder", checkAuthenticated, moveFolder);
};
