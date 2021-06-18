import Connection from "../database/Connection";
const files = Connection.db.collection("fs.files");

export const findFiles = async (whereClause: object): Promise<any> => {
  return await files.find(whereClause).toArray();
};

export const deleteFiles = async (whereClause: object): Promise<any> => {
  return await files.deleteMany(whereClause);
};

export const updateFiles = async (
  whereClause: object,
  updateClause: object
): Promise<any> => {
  return await files.updateMany(whereClause, updateClause);
};
