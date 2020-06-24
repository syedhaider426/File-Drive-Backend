const Connection = require("../database/Connection");
const mongodb = require("mongodb");

module.exports = checkFolderExists = async (req, res, next) => {
  const folders = Connection.db.collection("folders");
  if (!req.params.folder || req.params.folder.length != 24)
    res.redirect("/error");
  const folder = await folders.findOne({
    _id: new mongodb.ObjectID(req.params.folder),
  });
  if (!folder) return res.redirect("/error");
  next();
};
