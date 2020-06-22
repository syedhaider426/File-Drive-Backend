const { checkAuthenticated } = require("../middlewares/requireLogin");
const uploadFile = require("../controllers/fileUploadController");
module.exports = function (app) {
  app.post("/api/upload", checkAuthenticated, uploadFile);
};
