const { checkAuthenticated } = require("../middlewares/requireLogin");
const { createFolder } = require("../controllers/folderUploadController");
module.exports = (app) => {
  app.post("/createFolder", checkAuthenticated, createFolder);
};
