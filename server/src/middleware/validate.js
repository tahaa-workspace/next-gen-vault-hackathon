import { fail } from '../utils/response.js';
import { isValidObjectId } from '../utils/response.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json(fail('Validation failed', details));
    }
    req.body = value;
    next();
  };
}

export function validateIdParam(field = 'id') {
  return (req, res, next) => {
    const id = req.params[field];
    if (!isValidObjectId(id)) {
      return res.status(400).json(fail(`Invalid ${field}`));
    }
    next();
  };
}
