const { checkAuthenticated } = require("../middlewares/requireLogin");
const { createFolder } = require("../controllers/folderController");
module.exports = (app) => {
  app.post("/createFolder", checkAuthenticated, createFolder);
};
