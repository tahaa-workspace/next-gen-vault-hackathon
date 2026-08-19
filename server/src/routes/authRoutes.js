import { Router } from 'express';
import { register, login, logout, me, updateProfile, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../middleware/schemas.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);
router.patch('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);

export default router;
