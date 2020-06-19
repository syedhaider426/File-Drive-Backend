const bcrypt = require("bcrypt");

authenticateUser = async (email, password, done) => {
  const user = await getUserByEmail(email);
  console.log(user);
  if (user == null) {
    return done(null, false);
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (e) {
    return done(e);
  }
};

//https://stackoverflow.com/questions/54033722/async-await-is-not-working-for-mongo-db-queries
// You could even ditch the "async" keyword here,
// because you do not do/need any awaits inside the function.
// toArray() without a callback function argument already returns a promise.
getUserByEmail = (email) => {
  // Returns a Collection instance, not a Promise, so no need for await.
  const users = global.db.collection("users");

  // Without a callback, toArray() returns a Promise.
  // Because our functionOne is an "async" function, you do not need "await" for the return value.
  const result = users.findOne({ email: email });
  return result;
};

module.exports = {
  authenticateUser,
};
