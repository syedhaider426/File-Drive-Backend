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

module.exports = function (app) {
  (async () => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const bucket = new mongodb.GridFSBucket(db);
      const gfs = Grid(db, mongodb);
      console.log("Connected to DB");
      require("../routes/gridFs")(app, db, bucket, gfs);
      require("../startup/server")(app);
    } catch (err) {
      console.log("Unable to connect to DB");
      process.exit(-1);
    }
  })();
};
