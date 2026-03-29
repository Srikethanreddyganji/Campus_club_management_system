import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import eventRoutes from './eventRoutes.js';
import registrationRoutes from './registrationRoutes.js';
import clubRoutes from './clubRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/clubs', clubRoutes);

export default router;

