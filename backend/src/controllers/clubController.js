import { body, param, validationResult } from 'express-validator';
import Club from '../models/Club.js';

export const validateClubCreateOrUpdate = [
	body('name').isString().isLength({ min: 2 }),
	body('description').optional().isString(),
	body('adminUserId').isString()
];

export const validateClubIdParam = [
	param('id').isString().isLength({ min: 1 })
];

export async function listClubs(req, res) {
	const clubs = await Club.find().populate('adminUserId', 'name email');
	res.json(clubs);
}

export async function createClub(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const club = await Club.create(req.body);
	res.status(201).json(club);
}

export async function updateClub(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const club = await Club.findById(req.params.id);
	if (!club) return res.status(404).json({ message: 'Club not found' });
	club.name = req.body.name;
	club.description = req.body.description ?? club.description;
	club.adminUserId = req.body.adminUserId;
	await club.save();
	res.json(club);
}

export async function deleteClub(req, res) {
	const club = await Club.findById(req.params.id);
	if (!club) return res.status(404).json({ message: 'Club not found' });
	await club.deleteOne();
	res.json({ message: 'Club deleted' });
}

