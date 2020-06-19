const Connection = require("../database/Connection");

//Use connect method to connect to the server
//https://stackoverflow.com/questions/49397608/what-is-best-way-to-handle-global-connection-of-mongodb-in-nodejs
module.exports = function (app) {
  (async () => {
    try {
      await Connection.connectToMongo();
    } catch (err) {
      console.log("Unable to connect to DB");
      process.exit(-1);
    }
  })();
};
