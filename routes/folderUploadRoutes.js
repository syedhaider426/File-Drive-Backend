const { checkAuthenticated } = require("../middlewares/requireLogin");
const createFolder = require("../controllers/fileUploadController");
module.exports = (app) => {
  app.post("/api/createFolder", checkAuthenticated, createFolder);

  app.post("/api/upload", checkAuthenticated, uploadFile);
};
