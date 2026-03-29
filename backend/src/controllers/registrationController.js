import { body, param, validationResult } from 'express-validator';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

export const validateRegistrationCreate = [
	body('eventId').isString().isLength({ min: 1 })
];

export const validateRegistrationIdParam = [
	param('id').isString().isLength({ min: 1 })
];

export async function registerForEvent(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { eventId } = req.body;
	const event = await Event.findById(eventId);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	try {
		const registration = await Registration.create({
			userId: req.user.id,
			eventId,
			status: 'registered'
		});
		res.status(201).json(registration);
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ message: 'Already registered' });
		}
		res.status(500).json({ message: err.message });
	}
}

export async function cancelRegistration(req, res) {
	const reg = await Registration.findById(req.params.id);
	if (!reg) return res.status(404).json({ message: 'Registration not found' });
	if (req.user.role !== 'admin' && reg.userId.toString() !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	reg.status = 'cancelled';
	await reg.save();
	res.json(reg);
}

export async function listMyRegistrations(req, res) {
	const regs = await Registration.find({ userId: req.user.id, status: 'registered' })
		.populate('eventId');
	res.json(regs);
}

