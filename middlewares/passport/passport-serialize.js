const mongo = require("mongodb");

const user = {
  serialize: (user, done) => {
    done(null, user._id);
  },
  deserialize: async (id, done) => {
    const validUser = await getUserById(id);
    const deserializedUser = validUser[0];
    return done(null, deserializedUser);
  },
};

getUserById = (id) => {
  // Returns a Collection instance, not a Promise, so no need for await.
  const collection = global.db.collection("users");

  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  const result = collection.find({ _id: new mongo.ObjectID(id) });
  return result.toArray();
};

module.exports = user;
