const Connection = require("../database/Connection");

createFolder = async (req, res) => {
  const db = Connection.db;
  const folders = db.collection("folders");
  const folder = {
    UserID: "",
    ParentID: "",
    Title: req.body.title,
    Description: "",
    CreatedOn: new Date(),
    LastUpdatedOn: new Date(),
    CreatedBy: new Date(),
    LastUpdatedBy: new Date(),
  };
  const result = await folders.insertOne(folder);
  if (!result)
    return res.status(404).json({ message: "Unable to create folder" });
  return res.status(200).json({ message: "Created folder" });
};

module.exports = createFolder;
