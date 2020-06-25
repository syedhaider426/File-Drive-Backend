const Connection = require("../database/Connection");
const returnObjectID = require("../database/returnObjectID");

module.exports = checkFolderExists = async (req, res, next) => {
  const folders = Connection.db.collection("folders");
  if (!req.params.folder || req.params.folder.length != 24)
    res.redirect("/error");
  const folder = await folders.findOne({
    _id: returnObjectID(req.params.folder),
  });
  if (!folder) return res.redirect("/error");
  next();
};
