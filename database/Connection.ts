import mongodb, { MongoClient, Db, GridFSBucket } from "mongodb";
import { keys } from "../config/keys";

/**
 * Connection class is used to handle a global connection to the database.
 * Able to require the Connection class in a file and reference the db or gridfsbucket through
 * the object properties.
 */
export default class Connection {
  //Sets the Database property to null
  static db: Db;
  static gfs: GridFSBucket;
  //Sets the options for the database
  static options: { useNewUrlParser: boolean; useUnifiedTopology: boolean } = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  //Sets the connection uri
  static url: string = `mongodb://${
    process.env.NODE_ENV === "production" ? "mongo" : "localhost"
  }:27017`;

  //Function that allows the node instance to connect to the mongo database
  static async connectToMongo() {
    //If the function has already been called once, return;
    if (this.db) return;
    try {
      //Connect to the MongoURI
      const client = await MongoClient.connect(this.url, this.options);
      //Set the database
      this.db = client.db(keys.db);

      //Set the gridfsbucket based off the database passed in
      this.gfs = new mongodb.GridFSBucket(this.db);
      console.log("Connected to DB");
    } catch (err) {
      console.log("Unable to connect to DB");
      process.exit(-1);
    }
  }
}
