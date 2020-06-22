const Connection = require("../database/Connection");

createFolder = async (req, res) => {
  const db = Connection.db;
  const folders = db.collection("folders");
  const folder = {
    UserID: "",
    ParentID: "",
    Title: req.body.title,
    Description: "",
    CreatedOn: Date.now(),
    LastUpdatedOn: Date.now(),
    CreatedBy: Date.now(),
    LastUpdatedBy: Date.now(),
  };
  const result = await folders.insertOne(folder);
  if (!result)
    return res.status(404).json({ message: "Unable to create folder" });
  return res.status(200).json({ message: "Created folder" });
};

module.exports = createFolder;
