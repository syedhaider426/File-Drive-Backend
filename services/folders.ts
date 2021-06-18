import Connection from "../database/Connection";
const folders = Connection.db.collection("folders");

const findFolders = async (whereClause: object): Promise<any> => {
  return await folders.find(whereClause).toArray();
};

const deleteFolder = async (whereClause: object): Promise<any> => {
  return await folders.deleteMany(whereClause);
};

const createFolder = async (whereClause: object): Promise<any> => {
  return await folders.insertOne(whereClause);
};

const updateFolders = async (
  whereClause: object,
  updateClause: object
): Promise<any> => {
  return await folders.updateMany(whereClause, updateClause);
};

export { findFolders, deleteFolder, createFolder, updateFolders };
