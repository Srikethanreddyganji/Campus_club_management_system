import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_club_mgmt';

async function run() {
	await mongoose.connect(MONGO_URI);
	console.log('Connected to MongoDB for seeding');

	// Ensure admin exists
	const adminEmail = 'admin@example.com';
	let admin = await User.findOne({ email: adminEmail });
	if (!admin) {
		admin = await User.create({
			name: 'Admin User',
			email: adminEmail,
			password: 'Admin@123',
			role: 'admin'
		});
		console.log('Created admin:', admin.email);
	} else {
		console.log('Admin already exists:', admin.email);
	}

	// Create or get club
	let club = await Club.findOne({ name: 'Tech Club' });
	if (!club) {
		club = await Club.create({
			name: 'Tech Club',
			description: 'Tech talks and workshops',
			adminUserId: admin._id
		});
		console.log('Created club:', club.name);
	} else {
		console.log('Club already exists:', club.name);
	}

	// Create or get organizer
	const orgEmail = 'organizer@example.com';
	let organizer = await User.findOne({ email: orgEmail });
	if (!organizer) {
		organizer = await User.create({
			name: 'Organizer One',
			email: orgEmail,
			password: 'Organizer@123',
			role: 'organizer',
			clubId: club._id
		});
		console.log('Created organizer:', organizer.email);
	} else {
		// ensure role/club
		organizer.role = 'organizer';
		organizer.clubId = club._id;
		await organizer.save();
		console.log('Organizer exists, updated if needed:', organizer.email);
	}

	// Create a demo event
	let event = await Event.findOne({ title: 'Welcome Tech Meetup' });
	if (!event) {
		event = await Event.create({
			title: 'Welcome Tech Meetup',
			description: 'Kickoff session with lightning talks',
			date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			location: 'Main Auditorium',
			clubId: club._id,
			createdBy: organizer._id
		});
		console.log('Created event:', event.title);
	} else {
		console.log('Event already exists:', event.title);
	}

	console.log('Seed complete.');
	console.log('Admin login:', admin.email, 'Admin@123');
	console.log('Organizer login:', organizer.email, 'Organizer@123');
	await mongoose.disconnect();
}

run().catch(err => {
	console.error(err);
	process.exit(1);
});

