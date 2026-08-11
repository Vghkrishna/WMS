import ApiError from '../utils/ApiError.js';

/**
 * Guard a route so only the listed roles may access it.
 * Usage: router.post('/', protect, authorize('admin', 'manager'), handler)
 */
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied: this action requires one of [${allowedRoles.join(', ')}]`
        )
      );
    }
    return next();
  };
