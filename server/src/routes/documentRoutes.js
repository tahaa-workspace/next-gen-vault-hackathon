import { Router } from 'express';
import {
  uploadDocument, listDocuments, getDocument, downloadDocument, deleteDocument,
} from '../controllers/documentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateIdParam } from '../middleware/validate.js';
import { upload, uploadErrorHandler } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  requireRole('OWNER'),
  upload.single('file'),
  uploadErrorHandler,
  uploadDocument
);
router.get('/liability/:liabilityId', requireRole('OWNER'), validateIdParam('liabilityId'), listDocuments);
router.get('/:id/download', validateIdParam(), downloadDocument);
router.get('/:id', validateIdParam(), getDocument);
router.delete('/:id', requireRole('OWNER'), validateIdParam(), deleteDocument);

export default router;
