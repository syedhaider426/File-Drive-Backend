const Connection = require("../database/Connection");
const mongodb = require("mongodb");
//https://stackoverflow.com/questions/54033722/async-await-is-not-working-for-mongo-db-queries
// You could even ditch the "async" keyword here,
// because you do not do/need any awaits inside the function.
// toArray() without a callback function argument already returns a promise.
getUserByEmail = async (email) => {
  const db = Connection.db;
  // Returns a Collection instance, not a Promise, so no need for await.
  const users = db.collection("users");

  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  const result = await users.findOne({ email: email });
  return result;
};

getUserById = async (id) => {
  const db = Connection.db;
  // Returns a Collection instance, not a Promise, so no need for await.
  const users = db.collection("users");

  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  const result = await users.findOne({ _id: new mongodb.ObjectID(id) });
  return result;
};

module.exports = {
  getUserByEmail,
  getUserById,
};
