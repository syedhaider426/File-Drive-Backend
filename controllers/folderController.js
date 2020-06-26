const Connection = require("../database/Connection");
const Joi = require("@hapi/joi");
const returnObjectID = require("../database/returnObjectID");

exports.createFolder = async (req, res) => {
  const schema = Joi.object({
    folder: Joi.string().required(),
  });
  try {
    await schema.validate({ folder: req.body.title });
  } catch (err) {
    return res.redirect("/resetEmail");
  }

  const db = Connection.db;
  const folders = db.collection("folders");
  const folder = {
    UserID: req.user._id,
    ParentID: "",
    Title: req.body.title,
    Description: "",
    CreatedOn: new Date(),
    LastUpdatedOn: req.user.email,
    CreatedBy: new Date(),
    LastUpdatedBy: req.user.email,
  };
  try {
    const result = await folders.insertOne(folder);
    if (!result)
      return res.status(404).json({ message: "Unable to create folder" });
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.getFolders = (req, res) => {
  const db = Connection.db;
  const folders = db.collection("folders");
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  return folders.find({ UserID: req.user._id }).toArray();
};

exports.renameFolder = async (req, res) => {
  const folders = Connection.db.collection("folders");
  try {
    const result = await folders.updateOne(
      {
        _id: returnObjectID(req.body.folderID),
      },
      {
        $set: { Title: req.body.folder },
      }
    );
    if (!result) return res.redirect("/error");
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.moveFolders = async (req, res) => {
  const folders = Connection.db.collection("folders");
  let folderArray = [];
  //searches for user and file in files
  if (typeof req.body.folderID === "string")
    folderArray.push(returnObjectID(req.body.folderID));
  else
    req.body.folderID.forEach((folder) => {
      folderArray.push(returnObjectID(folder));
    });
  try {
    const result = await folders.updateOne(
      {
        _id: { $in: folderArray },
        UserID: returnObjectID(req.user._id),
      },
      {
        $set: { ParentID: returnObjectID(req.body.moveFolder) },
      }
    );
    if (!result) return res.redirect("/error");
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.deleteFolders = async (req, res) => {
  const folders = Connection.db.collection("folders");
  const files = Connection.db.collection("files");
  let folderArray = [];
  //searches for user and file in files
  if (typeof req.body.folderID === "string")
    folderArray.push(returnObjectID(req.body.folderID));
  else
    req.body.folderID.forEach((folder) => {
      folderArray.push(returnObjectID(folder));
    });
  try {
    const f = await files
      .find({
        "metadata.folder": { $in: folderArray },
      })
      .project({
        _id: 1,
      })
      .toArray();
    f.map(async (file) => {
      await gfs.delete(file._id);
    });
    const result = await folders.deleteOne({
      _id: { $in: folderArray },
    });
    if (!result) return res.redirect("/error");
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};
