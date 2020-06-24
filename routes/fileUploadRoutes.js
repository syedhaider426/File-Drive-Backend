const { checkAuthenticated } = require("../middlewares/requireLogin");
const { uploadFile } = require("../controllers/fileUploadController");
const checkFolderExists = require("../middlewares/checkFolderExists");
module.exports = (app) => {
  app.post("/api/upload", checkAuthenticated, uploadFile);

  app.post(
    "/api/upload/:folder",
    checkAuthenticated,
    checkFolderExists,
    uploadFile
  );
};
