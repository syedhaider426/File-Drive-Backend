checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
};

checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  next();
};
module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
};
