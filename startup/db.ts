import Connection from "../database/Connection";
// Module used to connect to Mongo database
export const connectToDB = (): Promise<void> => {
  return Connection.connectToMongo();
};
