const Connection = require("../database/Connection");
const Joi = require("@hapi/joi");
const returnObjectID = require("../database/returnObjectID");

exports.createFolder = async (req, res) => {
  const schema = Joi.object({
    folder: Joi.string().required(),
  });
  try {
    await schema.validate({ folder: req.body.folder });
  } catch (err) {
    return res.redirect("/resetEmail");
  }
  const folder = {
    UserID: req.user._id,
    ParentID: "",
    Title: req.body.folder,
    Description: "",
    CreatedOn: new Date(),
    LastUpdatedOn: req.user.email,
    CreatedBy: new Date(),
    LastUpdatedBy: req.user.email,
    IsTrashed: false,
  };
  try {
    const result = await Connection.db.collection("folders").insertOne(folder);
    if (!result)
      return res.status(404).json({ message: "Unable to create folder" });
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.getFolders = async (req, res) => {
  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  return await Connection.db
    .collection("folders")
    .find({ UserID: req.user._id, isTrashed: false })
    .toArray();
};

exports.renameFolder = async (req, res) => {
  try {
    const result = await Connection.db.collection("folders").updateOne(
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
  const folders = [];
  if (typeof req.body.folderID === "string")
    folders.push(returnObjectID(req.body.folderID));
  else
    req.body.folderID.forEach((folder) => {
      folders.push(returnObjectID(folder));
    });
  try {
    const result = await Connection.db.collection("folders").updateOne(
      {
        _id: { $in: folders },
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
  const folders = [];
  if (typeof req.body.folders === "string")
    folders.push(returnObjectID(req.body.folders));
  else
    req.body.folders.forEach((folder) => {
      folders.push(returnObjectID(folder));
    });
  try {
    const files = await Connection.db
      .collection("fs.files")
      .find({
        "metadata.folder": { $in: folders },
      })
      .project({
        _id: 1,
      })
      .toArray();
    files.map(async (file) => {
      await Connection.gfs.delete(file._id);
    });
    const result = await Connection.db.collection("folders").deleteMany({
      _id: { $in: folders },
    });
    if (!result) return res.redirect("/error");
    return res.redirect("/viewFolders");
  } catch (err) {
    console.error("Err", err);
  }
};

exports.trashFolders = async (req, res) => {
  const folders = [];
  if (typeof req.body.folderID === "string")
    folders.push(returnObjectID(req.body.folderID));
  else
    req.body.folderID.forEach((folder) => {
      folders.push(returnObjectID(folder));
    });
  //Find files and set isTrashed to true
  try {
    const result = await Connection.db.collection("folders").updateMany(
      {
        _id: { $in: folders },
      },
      { $set: { isTrashed: true, trashedAt: new Date() } }
    );
    if (!result) return res.redirect("/viewFolders");
    const result2 = await Connection.db.collection("fs.files").updateMany(
      {
        "metadata.folder": { $in: folders },
        "metadata.user": req.user._id,
      },
      { $set: { isTrashed: true, trashedAt: new Date() } }
    );
    if (!result2) return res.redirect("/viewFolders");
    res.redirect("/trashFolder");
  } catch (err) {
    console.log(err);
  }
};

exports.restoreFolders = async (req, res) => {
  const folders = [];
  if (typeof req.body.folders === "string")
    folders.push(returnObjectID(req.body.folders));
  else
    req.body.folders.forEach((folder) => {
      folders.push(returnObjectID(folder));
    });
  console.log(folders);
  const result = await Connection.db
    .collection("folders")
    .updateMany(
      { UserID: req.user._id, _id: { $in: folders } },
      { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
    );
  const result2 = await Connection.db
    .collection("fs.files")
    .updateMany(
      { "metadata.user": req.user._id, "metadata.folder": { $in: folders } },
      { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
    );
  if (!result2) return res.redirect("/viewFolders");
  return res.redirect("/viewFolders");
};

exports.getTrashFolders = async (req, res) => {
  return await Connection.db
    .collection("folders")
    .find({
      UserID: req.user._id,
      isTrashed: true,
    })
    .toArray();
};
