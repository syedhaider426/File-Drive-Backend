const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const Grid = require("gridfs-stream");
//Connection URL
const url = "mongodb://localhost:27017";

//Database Name
const dbName = "test";

//Create a new MongoClient
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Use connect method to connect to the server
//https://stackoverflow.com/questions/49397608/what-is-best-way-to-handle-global-connection-of-mongodb-in-nodejs
module.exports = function (app) {
  (async () => {
    try {
      await client.connect();
      console.log("Connected to DB");
      const db = client.db(dbName);
      global.db = db;
      const gfs = Grid(db, mongodb);
      require("../routes/gridFs")(app, db, gfs);
    } catch (err) {
      console.log("Unable to connect to DB");
      process.exit(-1);
    }
  })();
};
