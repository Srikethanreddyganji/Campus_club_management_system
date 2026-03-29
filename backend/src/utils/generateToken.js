import jwt from 'jsonwebtoken';

export function generateToken(user) {
	const payload = {
		id: user._id.toString(),
		role: user.role,
		clubId: user.clubId ? user.clubId.toString() : null,
		name: user.name,
		email: user.email
	};
	const secret = process.env.JWT_SECRET || 'dev_secret';
	const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
	return jwt.sign(payload, secret, { expiresIn });
}

