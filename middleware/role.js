const authorize = (...roles) => {
  const normalizedRoles = roles.map((role) => role.toLowerCase());
  return (req, res, next) => {
    if (!normalizedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient privileges');
    }
    next();
  };
};

module.exports = { authorize };
