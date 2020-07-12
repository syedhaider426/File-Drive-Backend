const Connection = require("../database/Connection");

/**
 * Module used to connect to Mongo database
 *
 */
module.exports = async () => {
  await Connection.connectToMongo();
};
