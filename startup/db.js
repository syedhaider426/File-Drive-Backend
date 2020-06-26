const Connection = require("../database/Connection");

/**
 * Module used to connect to Mongo database
 *
 */
module.exports = async () => {
  try {
    await Connection.connectToMongo();
  } catch (err) {
    console.log("Unable to connect to DB");
    process.exit(-1);
  }
};
