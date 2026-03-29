import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createClub, deleteClub, listClubs, updateClub, validateClubCreateOrUpdate, validateClubIdParam } from '../controllers/clubController.js';

const router = Router();

router.get('/', listClubs);

router.use(authenticate, authorize(['admin']));
router.post('/', validateClubCreateOrUpdate, createClub);
router.put('/:id', validateClubIdParam, validateClubCreateOrUpdate, updateClub);
router.delete('/:id', validateClubIdParam, deleteClub);

export default router;

