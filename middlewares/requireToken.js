const Connection = require("../database/Connection");

// Middleware used to check if the token is a valid token
module.exports = checkToken = async (req, res, next) => {
  //Gets the tokens collection
  const tokens = Connection.db.collection("tokens");

  //If no token is specified, return user to root page
  if (!req.query.token) res.redirect("/");

  //Find the token based off the token and the URL path: confirmRegistration/newPassword
  try {
    await tokens.findOne({
      token: req.query.token,
      path: req.path,
    });
    //If token does not exist, return user to root page; else, call next to pass control to next middleware
    if (!token) return res.redirect("/");
    next();
  } catch (err) {
    console.log(err);
  }
};
