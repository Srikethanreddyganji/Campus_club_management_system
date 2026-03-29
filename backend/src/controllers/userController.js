import { body, param, validationResult } from 'express-validator';
import User from '../models/User.js';

export const validateUserUpdate = [
	body('name').optional().isString().isLength({ min: 2 }),
	body('role').optional().isIn(['student', 'organizer', 'admin']),
	body('clubId').optional().isString()
];

export const validateUserIdParam = [
	param('id').isString().isLength({ min: 1 })
];

export async function getMe(req, res) {
	const user = await User.findById(req.user.id).select('-password');
	res.json(user);
}

export async function listUsers(req, res) {
	const users = await User.find().select('-password');
	res.json(users);
}

export async function updateUser(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	user.name = req.body.name ?? user.name;
	user.role = req.body.role ?? user.role;
	user.clubId = req.body.clubId ?? user.clubId;
	await user.save();
	res.json({ id: user._id, name: user.name, email: user.email, role: user.role, clubId: user.clubId });
}

export async function deleteUser(req, res) {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	await user.deleteOne();
	res.json({ message: 'User deleted' });
}

