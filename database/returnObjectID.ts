import { ObjectID } from "mongodb";

/**
 * Wrapper function for converting objectID into Mongo's ObjectID type
 *
 * @param {string} - objectID is converted into Mongo's ObjectID type
 */
const createObjectID = (objectID: string | ObjectID): string | ObjectID => {
  if (objectID === undefined || objectID === "") return "";
  return new ObjectID(objectID);
};

export default createObjectID;
