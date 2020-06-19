const bcrypt = require("bcrypt");
const { getUserByEmail } = require("../../controllers/userController");
authenticateUser = async (email, password, done) => {
  const user = await getUserByEmail(email);
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

module.exports = {
  authenticateUser,
};
