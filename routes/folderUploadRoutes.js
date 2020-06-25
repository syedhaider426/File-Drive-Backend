const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  createFolder,
  renameFolder,
} = require("../controllers/folderController");
module.exports = (app) => {
  app.post("/createFolder", checkAuthenticated, createFolder);

  app.post("/renameFolder", checkAuthenticated, renameFolder);
};
