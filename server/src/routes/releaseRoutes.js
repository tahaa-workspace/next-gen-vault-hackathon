import { Router } from 'express';
import {
  releasedLiabilities, releasedLiabilityDetail, releasedDocumentDownload,
} from '../controllers/releaseController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateIdParam } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, requireRole('BENEFICIARY'));

router.get('/released/liabilities', releasedLiabilities);
router.get('/released/liabilities/:id', validateIdParam(), releasedLiabilityDetail);
router.get('/released/documents/:id/download', validateIdParam(), releasedDocumentDownload);

export default router;
