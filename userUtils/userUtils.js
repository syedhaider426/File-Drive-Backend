const mongo = require("mongodb");

//https://stackoverflow.com/questions/54033722/async-await-is-not-working-for-mongo-db-queries
// You could even ditch the "async" keyword here,
// because you do not do/need any awaits inside the function.
// toArray() without a callback function argument already returns a promise.
getUserByEmail = (email) => {
  // Returns a Collection instance, not a Promise, so no need for await.
  const collection = global.db.collection("users");
  try {
    // Without a callback, toArray() returns a Promise.
    // Because our functionOne is an "async" function, you do not need "await" for the return value.
    const result = collection.find({ email: email });
    return result.toArray();
  } catch (err) {
    res.status(404).json({ message: "Unable to find user" });
  }
};

getUserById = (id) => {
  // Returns a Collection instance, not a Promise, so no need for await.
  const collection = global.db.collection("users");
  try {
    // Without a callback, toArray() returns a Promise.
    // Because our functionOne is an "async" function, you do not need "await" for the return value.
    const result = collection.find({ _id: new mongo.ObjectID(id) });
    return result.toArray();
  } catch (err) {
    res.status(404).json({ message: "Unable to find user" });
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
};
