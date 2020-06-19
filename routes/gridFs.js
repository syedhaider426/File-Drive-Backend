const {
  checkAuthenticated,
} = require("../middlewares/passport/checkAuthentication");
const {
  createFolder,
  uploadFile,
} = require("../controllers/fileUploadController");
module.exports = function (app) {
  app.post("/api/createFolder", checkAuthenticated, createFolder);

  app.post("/api/upload", checkAuthenticated, uploadFile);
};
