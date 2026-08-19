import { Router } from 'express';
import {
  listLiabilities, getLiability, createLiability, updateLiability, deleteLiability,
  closeLiability, archiveLiability, restoreLiability, dashboardStats,
} from '../controllers/liabilityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { createLiabilitySchema, updateLiabilitySchema } from '../middleware/schemas.js';

const router = Router();

router.use(authenticate, requireRole('OWNER'));

router.get('/dashboard', dashboardStats);
router.get('/', listLiabilities);
router.post('/', validateBody(createLiabilitySchema), createLiability);
router.get('/:id', validateIdParam(), getLiability);
router.patch('/:id', validateIdParam(), validateBody(updateLiabilitySchema), updateLiability);
router.delete('/:id', validateIdParam(), deleteLiability);
router.post('/:id/close', validateIdParam(), closeLiability);
router.post('/:id/archive', validateIdParam(), archiveLiability);
router.post('/:id/restore', validateIdParam(), restoreLiability);

export default router;
