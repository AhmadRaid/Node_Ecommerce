const { roles } = require("../utils/role");

exports.grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can('admin')[action](resource);
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
