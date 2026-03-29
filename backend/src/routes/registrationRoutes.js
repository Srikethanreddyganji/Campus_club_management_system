import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { cancelRegistration, listMyRegistrations, registerForEvent, validateRegistrationCreate, validateRegistrationIdParam } from '../controllers/registrationController.js';

const router = Router();

router.use(authenticate);
router.get('/me', listMyRegistrations);
router.post('/', validateRegistrationCreate, registerForEvent);
router.patch('/:id/cancel', validateRegistrationIdParam, cancelRegistration);

export default router;

