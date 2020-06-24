const mongodb = require("mongodb");

createObjectID = (objectID) => {
  return new mongodb.ObjectID(objectID);
};

module.exports = createObjectID;
