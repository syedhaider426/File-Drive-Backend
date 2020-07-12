const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

/**
 * Connection class is used to handle a global connection to the database.
 * Able to require the Connection class in a file and reference the db or gridfsbucket through
 * the object properties.
 */
class Connection {
  //Function that allows the node instance to connect to the mongo database
  static async connectToMongo() {
    //If the function has already been called once, return;
    if (this.db) return;

    try {
      //Connect to the MongoURI
      const client = await MongoClient.connect(this.url, this.options);

      //Set the database
      this.db = client.db("test");

      //Set the gridfsbucket based off the database passed in
      this.gfs = new mongodb.GridFSBucket(this.db);
      console.log("Connected to DB");
    } catch (err) {
      console.log("Unable to connect to DB");
      process.exit(-1);
    }
  }
}

//Sets the Database property to null
Connection.db = null;

//Sets the connection uri
Connection.url = "mongodb://localhost:27017";

//Sets the options for the database
Connection.options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//Sets the gridfsbucket property to null
Connection.gfs = null;

module.exports = Connection;
