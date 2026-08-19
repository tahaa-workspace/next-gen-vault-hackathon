import { Router } from 'express';
import {
  createActivationRequest, myActivationRequests,
} from '../controllers/activationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { activationRequestSchema } from '../middleware/schemas.js';

const router = Router();

router.use(authenticate, requireRole('BENEFICIARY'));

router.post('/', validateBody(activationRequestSchema), createActivationRequest);
router.get('/mine', myActivationRequests);

export default router;
