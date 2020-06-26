// Middleware that exports two functions which determine if the user is logged in

// Checks if the user is authenticated
checkAuthenticated = (req, res, next) => {
  //If user is not authenticated, call next to pass control to next middleware; else, take user to root page of website
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
};
// Checks if the user is not authenticated
checkNotAuthenticated = (req, res, next) => {
  //If the user is authenticated, take user to their home page; ; else, call next to pass control to next middleware
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  next();
};
module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
};
