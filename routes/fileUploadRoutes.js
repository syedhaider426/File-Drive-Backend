const { checkAuthenticated } = require("../middlewares/requireLogin");
const {
  uploadFile,
  moveFiles,
  deleteFiles,
} = require("../controllers/fileController");
const checkFolderExists = require("../middlewares/checkFolderExists");
module.exports = (app) => {
  app.post("/api/upload", checkAuthenticated, uploadFile);

  app.post(
    "/api/upload/:folder",
    checkAuthenticated,
    checkFolderExists,
    uploadFile
  );

  app.post("/moveFiles", checkAuthenticated, moveFiles);

  app.post("/deleteFiles", checkAuthenticated, deleteFiles);
};
