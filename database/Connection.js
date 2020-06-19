//https://stackoverflow.com/questions/49397608/what-is-best-way-to-handle-global-connection-of-mongodb-in-nodejs
/* Handling global connection of MongoDB */
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

class Connection {
  static async connectToMongo() {
    if (this.db) return this.db;
    const client = await MongoClient.connect(this.url, this.options);
    this.db = client.db("test");
    this.gfs = new mongodb.GridFSBucket(this.db);
    console.log("Connected to DB");
    return this.db;
  }
}

Connection.db = null;
Connection.url = "mongodb://localhost:27017";
Connection.options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
Connection.gfs = null;
module.exports = Connection;
