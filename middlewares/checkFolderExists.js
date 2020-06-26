const Connection = require("../database/Connection");
const returnObjectID = require("../database/returnObjectID");

// Middleware used to check if the folder in the URL params exists
module.exports = checkFolderExists = async (req, res, next) => {
  //Gets folders collection
  const folders = Connection.db.collection("folders");

  //If there is no folder in the URL params or the ObjectID is greater than 24, throw error
  if (!req.params.folder || req.params.folder.length != 24)
    res.redirect("/error");

  //Find the specified folder
  try {
    const folder = await folders.findOne({
      _id: returnObjectID(req.params.folder),
    });
    //If folder is not found, throw an error; else, navigate to the next middleware
    if (!folder) return res.redirect("/error");
    next();
  } catch (err) {
    console.log(err);
  }
};
