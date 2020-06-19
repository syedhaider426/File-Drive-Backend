const { getUserById } = require("../../controllers/userController");
const user = {
  serialize: (user, done) => {
    done(null, user._id);
  },
  deserialize: async (id, done) => {
    const validUser = await getUserById(id);
    return done(null, validUser);
  },
};

module.exports = user;
