import multer from 'multer';
import { config } from '../config/env.js';
import { fail } from '../utils/response.js';

const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg'];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, PNG and JPG files are allowed'));
  },
});

export function uploadErrorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(fail(`File too large. Max ${config.maxFileSizeMb} MB`));
    }
    return res.status(400).json(fail(err.message));
  }
  if (err) {
    return res.status(400).json(fail(err.message));
  }
}
