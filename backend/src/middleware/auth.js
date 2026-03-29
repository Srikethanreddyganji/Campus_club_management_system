import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authenticate(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

export function authorize(roles = []) {
	const allowed = Array.isArray(roles) ? roles : [roles];
	return async function (req, res, next) {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (allowed.length === 0) return next();
		if (allowed.includes(req.user.role)) return next();
		// Organizer special case: allow organizers to manage their own club resources checked in controllers
		return res.status(403).json({ message: 'Forbidden' });
	};
}

