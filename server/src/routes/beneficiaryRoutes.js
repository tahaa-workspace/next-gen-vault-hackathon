import { Router } from 'express';
import {
  listMyBeneficiaries, addBeneficiary, acceptInvitation, rejectInvitation,
  revokeRelationship, myInvitations, myOwners,
} from '../controllers/beneficiaryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { addBeneficiarySchema } from '../middleware/schemas.js';

const router = Router();

router.use(authenticate);

// Owner endpoints
router.get('/', requireRole('OWNER'), listMyBeneficiaries);
router.post('/', requireRole('OWNER'), validateBody(addBeneficiarySchema), addBeneficiary);
router.delete('/:id', requireRole('OWNER'), validateIdParam(), revokeRelationship);

// Beneficiary endpoints
router.get('/invitations', requireRole('BENEFICIARY'), myInvitations);
router.get('/owners', requireRole('BENEFICIARY'), myOwners);
router.patch('/:id/accept', requireRole('BENEFICIARY'), validateIdParam(), acceptInvitation);
router.patch('/:id/reject', requireRole('BENEFICIARY'), validateIdParam(), rejectInvitation);

export default router;
