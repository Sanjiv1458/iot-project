class isLoggedin {
  static isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/unAuth');
  };
}
export default isLoggedin;