import { validationResult, body, param } from 'express-validator';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

export const validateCreateOrUpdateEvent = [
	body('title').isString().isLength({ min: 3 }),
	body('description').optional().isString(),
	body('date').isISO8601(),
	body('location').isString().isLength({ min: 2 }),
	body('clubId').isString()
];

export const validateEventIdParam = [
	param('id').isString().isLength({ min: 1 })
];

export async function listEvents(req, res) {
	const events = await Event.find().sort({ date: 1 }).populate('clubId', 'name');
	res.json(events);
}

export async function getEventById(req, res) {
	const event = await Event.findById(req.params.id).populate('clubId', 'name description');
	if (!event) return res.status(404).json({ message: 'Event not found' });
	res.json(event);
}

export async function createEvent(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	// organizers can only create for their club unless admin
	if (req.user.role === 'organizer') {
		if (!req.user.clubId || req.user.clubId !== req.body.clubId) {
			return res.status(403).json({ message: 'Cannot create event for another club' });
		}
	}
	const payload = { ...req.body, createdBy: req.user.id };
	const event = await Event.create(payload);
	res.status(201).json(event);
}

export async function updateEvent(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	if (req.user.role === 'organizer') {
		if (!req.user.clubId || event.clubId.toString() !== req.user.clubId) {
			return res.status(403).json({ message: 'Cannot modify event of another club' });
		}
	}
	event.title = req.body.title;
	event.description = req.body.description ?? event.description;
	event.date = new Date(req.body.date);
	event.location = req.body.location;
	event.clubId = req.body.clubId;
	await event.save();
	res.json(event);
}

export async function deleteEvent(req, res) {
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	if (req.user.role === 'organizer') {
		if (!req.user.clubId || event.clubId.toString() !== req.user.clubId) {
			return res.status(403).json({ message: 'Cannot delete event of another club' });
		}
	}
	await Registration.deleteMany({ eventId: event._id });
	await event.deleteOne();
	res.json({ message: 'Event deleted' });
}

export async function listEventParticipants(req, res) {
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	if (req.user.role === 'organizer') {
		if (!req.user.clubId || event.clubId.toString() !== req.user.clubId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
	}
	const registrations = await Registration.find({ eventId: event._id, status: 'registered' })
		.populate('userId', 'name email');
	res.json(registrations);
}

