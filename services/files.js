const Connection = require("../database/Connection");
const files = Connection.db.collection("fs.files");

exports.findFiles = async (whereClause) => {
  return await files.find(whereClause).toArray();
};

exports.deleteFiles = async (whereClause) => {
  return await files.deleteMany(whereClause);
};

exports.updateFiles = async (whereClause, updateClause) => {
  return await files.updateMany(whereClause, updateClause);
};
