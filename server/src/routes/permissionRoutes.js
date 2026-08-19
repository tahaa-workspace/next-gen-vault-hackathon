import { Router } from 'express';
import {
  listPermissions, createPermission, bulkCreatePermissions, updatePermission, deletePermission,
} from '../controllers/permissionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { createPermissionSchema, bulkPermissionSchema } from '../middleware/schemas.js';
import Joi from 'joi';

const router = Router();

router.use(authenticate, requireRole('OWNER'));

router.get('/', listPermissions);
router.post('/', validateBody(createPermissionSchema), createPermission);
router.post('/bulk', validateBody(bulkPermissionSchema), bulkCreatePermissions);
router.patch('/:id', validateIdParam(), validateBody(Joi.object({ status: Joi.string().valid('ACTIVE', 'REVOKED').required() })), updatePermission);
router.delete('/:id', validateIdParam(), deletePermission);

export default router;
