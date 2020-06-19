checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/file");
  }
  next();
};

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
};
