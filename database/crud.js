const Connection = require("./Connection");

exports.findFiles = async (whereClause) => {
  try {
    return await Connection.db
      .collection("fs.files")
      .find(whereClause)
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.deleteFiles = async (whereClause) => {
  try {
    return await Connection.db.collection("fs.files").deleteMany(whereClause);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error deleting the file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.updateFiles = async (whereClause, updateClause) => {
  try {
    return await Connection.db
      .collection("fs.files")
      .updateMany(whereClause, updateClause);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message: "There was an error updating the file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.findFolders = async (whereClause) => {
  try {
    return await Connection.db
      .collection("folders")
      .find(whereClause)
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error finding the folder(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.deleteFolder = async (whereClause) => {
  try {
    return await Connection.db.collection("folders").deleteMany(whereClause);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error deleting the folder(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.createFolder = async (whereClause) => {
  try {
    return await Connection.db.collection("folders").insertOne(whereClause);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error creating the folder(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.updateFolders = async (whereClause, updateClause) => {
  try {
    return await Connection.db
      .collection("folders")
      .updateMany(whereClause, updateClause);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error updating the folder(s). Please try again.",
        },
      });
    else next(err);
  }
};
