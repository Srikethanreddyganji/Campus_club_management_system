import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { deleteUser, getMe, listUsers, updateUser, validateUserIdParam, validateUserUpdate } from '../controllers/userController.js';

const router = Router();

router.get('/me', authenticate, getMe);

router.use(authenticate, authorize(['admin']));
router.get('/', listUsers);
router.put('/:id', validateUserIdParam, validateUserUpdate, updateUser);
router.delete('/:id', validateUserIdParam, deleteUser);

export default router;

