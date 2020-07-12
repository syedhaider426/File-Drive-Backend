const mongodb = require("mongodb");

/**
 * Wrapper function for converting objectID into Mongo's ObjectID type
 *
 * @param {string} - objectID is converted into Mongo's ObjectID type
 */
createObjectID = (objectID) => {
  if (objectID === undefined || objectID === "") return "";
  return new mongodb.ObjectID(objectID);
};

module.exports = createObjectID;
