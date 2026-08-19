import { Router } from 'express';
import {
  dashboard, listUsers, updateUserStatus,
} from '../controllers/adminController.js';
import {
  adminListRequests, adminGetRequest, adminUpdateStatus, adminDecision,
} from '../controllers/activationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { userStatusSchema, activationStatusSchema, activationDecisionSchema } from '../middleware/schemas.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.patch('/users/:id/status', validateIdParam(), validateBody(userStatusSchema), updateUserStatus);

router.get('/activation-requests', adminListRequests);
router.get('/activation-requests/:id', validateIdParam(), adminGetRequest);
router.patch('/activation-requests/:id/status', validateIdParam(), validateBody(activationStatusSchema), adminUpdateStatus);
router.patch('/activation-requests/:id/decision', validateIdParam(), validateBody(activationDecisionSchema), adminDecision);

export default router;
