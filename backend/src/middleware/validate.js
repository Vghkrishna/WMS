import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Collect express-validator results and convert the first failure set
 * into a 400 ApiError with a structured `errors` payload.
 */
const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  const err = new ApiError(400, 'Validation failed');
  err.errors = errors;
  return next(err);
};

export default validate;
