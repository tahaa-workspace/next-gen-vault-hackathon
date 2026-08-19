import { fail } from '../utils/response.js';

export function notFound(req, res) {
  res.status(404).json(fail('Resource not found'));
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[error]', message, err.stack || err);
  }

  if (status === 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json(fail('Internal server error'));
  }

  res.status(status).json(fail(message, err.details || undefined));
}
