const Connection = require("../database/Connection");
const folders = Connection.db.collection("folders");

exports.findFolders = async (whereClause) => {
  return await folders.find(whereClause).toArray();
};

exports.deleteFolder = async (whereClause) => {
  return await folders.deleteMany(whereClause);
};

exports.createFolder = async (whereClause) => {
  return await folders.insertOne(whereClause);
};

exports.updateFolders = async (whereClause, updateClause) => {
  return await folders.updateMany(whereClause, updateClause);
};
